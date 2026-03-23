import { Injectable } from '@angular/core';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HinkalInstanceService } from './hinkal-instance.service';
import { HinkalSwapService } from './hinkal-swap.service';
import { HinkalBalanceService } from './hinkal-balance.service';
import {
  BehaviorSubject,
  distinctUntilChanged,
  Observable,
  skip,
  Subscription,
  switchMap,
  tap
} from 'rxjs';
import {
  BLOCKCHAIN_NAME,
  blockchainId,
  BlockchainName,
  EvmBlockchainName,
  TokenAmount
} from '@cryptorubic/core';
import { HinkalWorkerService } from './hinkal-worker.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';

@Injectable()
export class HinkalFacadeService {
  private readonly subs: Subscription[] = [];

  private readonly _activeChain$ = new BehaviorSubject<BlockchainName>(BLOCKCHAIN_NAME.BASE);

  public switchChain(chain: BlockchainName): void {
    this._activeChain$.next(chain);
  }

  public readonly activeChain$ = this._activeChain$.asObservable();

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly hinkalInstanceService: HinkalInstanceService,
    private readonly hinkalSwapService: HinkalSwapService,
    private readonly hinkalBalanceService: HinkalBalanceService,
    private readonly hinkalWorkerService: HinkalWorkerService,
    private readonly notificationService: NotificationsService
  ) {
    this.initSubs();
  }

  private initSubs(): void {
    //const walletSub = this.subscribeOnAddressChanged().subscribe();
    const activeNetworkSub = this.subscribeOnActiveNetworkChanged().subscribe();
    const pollSub = this.hinkalBalanceService.initBalancePolling();
    const balanceSub = this.hinkalBalanceService.subscribeOnBalancePolling();

    this.subs.push(activeNetworkSub, pollSub, balanceSub);
  }

  private showSuccessNotification(message: string): void {
    this.notificationService.show(message, {
      status: 'info',
      autoClose: 15_000,
      data: null,
      icon: '',
      defaultAutoCloseTime: 0
    });
  }

  public async deposit(tokenAmount: TokenAmount<EvmBlockchainName>): Promise<void> {
    if (tokenAmount.blockchain !== this.walletConnectorService.network) {
      await this.walletConnectorService.switchChain(tokenAmount.blockchain);
    }

    const isSuccess = await this.hinkalSwapService.deposit(tokenAmount);

    if (isSuccess) {
      this.showSuccessNotification('Transaction sent. 5-10 seconds on update balance');
    }
  }

  public async withdraw(token: TokenAmount<EvmBlockchainName>, receiver?: string): Promise<void> {
    if (token.blockchain !== this.walletConnectorService.network) {
      await this.walletConnectorService.switchChain(token.blockchain);
    }

    const isSuccess = await this.hinkalSwapService.withdraw(token, receiver);

    if (isSuccess) {
      this.showSuccessNotification(
        'Transaction sent. This may take a moment. Please keep Rubic App open'
      );
    }
  }

  public async transfer(
    token: TokenAmount<EvmBlockchainName>,
    receiverPrivateShieldedKey: string
  ): Promise<void> {
    if (token.blockchain !== this.walletConnectorService.network) {
      await this.walletConnectorService.switchChain(token.blockchain);
    }

    const isSuccess = await this.hinkalSwapService.privateTransfer(
      token,
      receiverPrivateShieldedKey
    );

    if (isSuccess) {
      this.showSuccessNotification(
        'Transaction sent. This may take a moment. Please keep Rubic App open'
      );
    }
  }

  public async swap(
    fromToken: TokenAmount<EvmBlockchainName>,
    toToken: TokenAmount<EvmBlockchainName>
  ): Promise<void> {
    if (fromToken.blockchain !== this.walletConnectorService.network) {
      await this.walletConnectorService.switchChain(fromToken.blockchain);
    }

    const isSuccess = await this.hinkalSwapService.privateSwap(fromToken, toToken);

    if (isSuccess) {
      this.showSuccessNotification(
        'Transaction sent. This may take a moment. Please keep Rubic App open'
      );
    }
  }

  public logout(): void {
    this.hinkalInstanceService.resetInstance();
    this.hinkalBalanceService.stopPolling();
  }

  public async updateInstance(): Promise<void> {
    try {
      if (!this.walletConnectorService.address) {
        this.notificationService.showWarning('Wallet not connected');
        return;
      }

      const isSuccess = await this.hinkalInstanceService.updateInstance(
        this.walletConnectorService.address,
        this.walletConnectorService.network as EvmBlockchainName
      );

      if (isSuccess) this.hinkalBalanceService.startPolling();
    } catch {}
  }

  private subscribeOnActiveNetworkChanged(): Observable<void> {
    return this.activeChain$.pipe(
      tap(chain => console.log('CHAIN SWITCHED', chain)),
      skip(1),
      distinctUntilChanged(),
      switchMap(chain => {
        this.hinkalBalanceService.stopPolling();

        return this.hinkalWorkerService
          .request<void>({
            params: {
              chainId: blockchainId[chain],
              address: this.walletConnectorService.address
            },
            type: 'switchNetwork'
          })
          .then(() => this.hinkalBalanceService.startPolling());
      })
    );
  }

  public removeSubs(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
