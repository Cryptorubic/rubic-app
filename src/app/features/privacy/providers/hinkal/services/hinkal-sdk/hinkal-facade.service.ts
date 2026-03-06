import { Injectable } from '@angular/core';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HinkalInstanceService } from './hinkal-instance.service';
import { HinkalSwapService } from './hinkal-swap.service';
import { HinkalBalanceService } from './hinkal-balance.service';
import { distinctUntilChanged, firstValueFrom, Observable, Subscription, switchMap } from 'rxjs';
import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';
import { waitFor } from '@cryptorubic/web3';
import { HINKAL_SUPPORTED_CHAINS } from '../../constants/hinkal-supported-chains';
import { SignMessageModalComponent } from '../../../shared-privacy-providers/components/sign-message-modal/sign-message-modal.component';
import { ModalService } from '@app/core/modals/services/modal.service';

@Injectable()
export class HinkalFacadeService {
  private readonly subs: Subscription[] = [];

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly hinkalInstanceService: HinkalInstanceService,
    private readonly hinkalSwapService: HinkalSwapService,
    private readonly hinkalBalanceService: HinkalBalanceService,
    private readonly modalService: ModalService
  ) {
    this.initSubs();
  }

  private initSubs(): void {
    const walletSub = this.subscribeOnAddressChanged().subscribe();
    const networkSub = this.subscribeOnNetworkChanged().subscribe();

    this.subs.push(walletSub, networkSub);
  }

  private async refreshBalancesAfterAction(): Promise<void> {
    await waitFor(2000);
    this.hinkalBalanceService.refreshBalances();
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
      .then(() => this.refreshBalancesAfterAction());
  }

  public async withdraw(token: TokenAmount<EvmBlockchainName>, receiver?: string): Promise<void> {
    if (token.blockchain !== this.walletConnectorService.network) {
      await this.walletConnectorService.switchChain(token.blockchain);
    }

    return this.hinkalSwapService
      .withdraw(token, receiver)
      .then(() => this.refreshBalancesAfterAction());
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
      .then(() => this.refreshBalancesAfterAction());
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
      .then(() => this.refreshBalancesAfterAction());
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

    await this.hinkalInstanceService.hinkalInstance.resetMerkleTreesIfNecessary();
  }

  private subscribeOnAddressChanged(): Observable<void> {
    return this.walletConnectorService.addressChange$.pipe(
      distinctUntilChanged(),
      switchMap(address =>
        this.updateInstance(address, this.walletConnectorService.network as EvmBlockchainName).then(
          () => this.hinkalBalanceService.refreshBalances()
        )
      )
    );
  }

  private subscribeOnNetworkChanged(): Observable<void> {
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
