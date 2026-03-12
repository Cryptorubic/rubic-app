import { Injectable } from '@angular/core';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HinkalInstanceService } from './hinkal-instance.service';
import { HinkalSwapService } from './hinkal-swap.service';
import { HinkalBalanceService } from './hinkal-balance.service';
import {
  BehaviorSubject,
  distinctUntilChanged,
  firstValueFrom,
  Observable,
  skip,
  Subscription,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs';
import {
  BLOCKCHAIN_NAME,
  blockchainId,
  BlockchainName,
  EvmBlockchainName,
  TokenAmount
} from '@cryptorubic/core';
import { waitFor } from '@cryptorubic/web3';
import { HINKAL_SUPPORTED_CHAINS } from '../../constants/hinkal-supported-chains';
import { SignMessageModalComponent } from '../../../shared-privacy-providers/components/sign-message-modal/sign-message-modal.component';
import { ModalService } from '@app/core/modals/services/modal.service';
import { HinkalWorkerService } from './hinkal-worker.service';

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
    private readonly modalService: ModalService,
    private readonly hinkalWorkerService: HinkalWorkerService
  ) {
    this.initSubs();
  }

  private initSubs(): void {
    const walletSub = this.subscribeOnAddressChanged().subscribe();
    const activeNetworkSub = this.subscribeOnActiveNetworkChanged().subscribe();
    const walletNetworkSub = this.subscribeOnWalletNetworkChanged().subscribe();

    this.subs.push(walletSub, activeNetworkSub, walletNetworkSub);
  }

  private async refreshBalancesAfterAction(chain: EvmBlockchainName): Promise<void> {
    await waitFor(2000);
    this.hinkalBalanceService.refreshBalances([chain]);
  }

  public async deposit(
    tokenAmount: TokenAmount<EvmBlockchainName>,
    receiverPrivateShieldedKey?: string
  ): Promise<void> {
    if (tokenAmount.blockchain !== this.walletConnectorService.network) {
      await this.walletConnectorService.switchChain(tokenAmount.blockchain);
    }

    return this.hinkalSwapService
      .deposit(tokenAmount, receiverPrivateShieldedKey)
      .then(isSuccess => isSuccess && this.refreshBalancesAfterAction(tokenAmount.blockchain));
  }

  public async withdraw(token: TokenAmount<EvmBlockchainName>, receiver?: string): Promise<void> {
    if (token.blockchain !== this.walletConnectorService.network) {
      await this.walletConnectorService.switchChain(token.blockchain);
    }

    return this.hinkalSwapService
      .withdraw(token, receiver)
      .then(isSuccess => isSuccess && this.refreshBalancesAfterAction(token.blockchain));
  }

  public async transfer(
    token: TokenAmount<EvmBlockchainName>,
    receiverPrivateShieldedKey: string
  ): Promise<void> {
    if (token.blockchain !== this.walletConnectorService.network) {
      await this.walletConnectorService.switchChain(token.blockchain);
    }

    return this.hinkalSwapService
      .privateTransfer(token, receiverPrivateShieldedKey)
      .then(isSuccess => isSuccess && this.refreshBalancesAfterAction(token.blockchain));
  }

  public async swap(
    fromToken: TokenAmount<EvmBlockchainName>,
    toToken: TokenAmount<EvmBlockchainName>
  ): Promise<void> {
    if (fromToken.blockchain !== this.walletConnectorService.network) {
      await this.walletConnectorService.switchChain(fromToken.blockchain);
    }

    return this.hinkalSwapService
      .privateSwap(fromToken, toToken)
      .then(isSuccess => isSuccess && this.refreshBalancesAfterAction(fromToken.blockchain));
  }

  private async updateInstance(
    userAddress: string | null,
    blockchain: EvmBlockchainName
  ): Promise<void> {
    if (!userAddress) {
      this.hinkalInstanceService.resetInstance();
      return;
    }

    const signMessage = async () => {
      try {
        let chain = blockchain;
        if (!HINKAL_SUPPORTED_CHAINS.includes(chain)) {
          chain = HINKAL_SUPPORTED_CHAINS[0];
          await this.walletConnectorService.switchChain(chain);
        }

        return this.hinkalInstanceService.updateInstance(
          userAddress,
          chain,
          this.walletConnectorService.provider.wallet
        );
      } catch {}
    };

    await firstValueFrom(
      this.modalService.showDialog(SignMessageModalComponent, {
        size: 's',
        dismissible: false,
        fitContent: true,
        closeable: false,
        data: {
          signMessage,
          isSdkLoading$: false
        }
      })
    );
  }

  private subscribeOnAddressChanged(): Observable<void> {
    return this.walletConnectorService.addressChange$.pipe(
      withLatestFrom(this.activeChain$),
      distinctUntilChanged(),
      switchMap(([address, network]) => {
        const chain = network as EvmBlockchainName;
        return this.updateInstance(address, chain).then(() =>
          this.refreshBalancesAfterAction(chain)
        );
      })
    );
  }

  private subscribeOnActiveNetworkChanged(): Observable<void> {
    return this.activeChain$.pipe(
      tap(chain => console.log('CHAIN SWITCHED', chain)),
      skip(1),
      distinctUntilChanged(),
      switchMap(chain =>
        this.hinkalWorkerService
          .request({
            chainId: blockchainId[chain],
            type: 'switchNetwork',
            address: this.walletConnectorService.address
          })
          .then(() => this.refreshBalancesAfterAction(chain as EvmBlockchainName))
      )
    );
  }

  private subscribeOnWalletNetworkChanged(): Observable<void> {
    return this.walletConnectorService.networkChange$.pipe(
      distinctUntilChanged(),
      switchMap(() =>
        this.hinkalInstanceService.updateAdapter(this.walletConnectorService.provider.wallet)
      )
    );
  }

  public removeSubs(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
