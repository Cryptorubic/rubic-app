import { Injectable } from '@angular/core';
import { ZamaSwapService } from './zama-swap.service';
import { initSDK } from '@zama-fhe/relayer-sdk/web';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import {
  BehaviorSubject,
  distinctUntilChanged,
  firstValueFrom,
  from,
  Observable,
  Subscription,
  switchMap
} from 'rxjs';
import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';
import { ZamaInstanceService } from './zama-instance.service';
import { ZamaTokensService } from './zama-tokens.service';
import { ZamaBalanceService } from './zama-balance.service';
import { ZamaSignatureService } from './zama-signature.service';
import { waitFor } from '@cryptorubic/web3';
import { ModalService } from '@app/core/modals/services/modal.service';
import { SignMessageModalComponent } from '../../components/sign-message-modal/sign-message-modal.component';
import { ZAMA_SUPPORTED_CHAINS, ZamaSupportedChain } from '../../constants/chains';

@Injectable()
export class ZamaFacadeService {
  private readonly subs: Subscription[] = [];

  private readonly _sdkLoading$ = new BehaviorSubject(false);

  private readonly sdkLoading$ = this._sdkLoading$.asObservable();

  constructor(
    private readonly zamaSwapService: ZamaSwapService,
    private readonly zamaInstanceService: ZamaInstanceService,
    private readonly zamaBalanceService: ZamaBalanceService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly zamaTokensService: ZamaTokensService,
    private readonly zamaSignatureService: ZamaSignatureService,
    private readonly modalService: ModalService
  ) {}

  public async initServices(): Promise<void> {
    try {
      this._sdkLoading$.next(true);
      this.initSubs();
      await this.zamaTokensService.initTokensMapping();
      await initSDK({
        tfheParams: 'assets/zama/tfhe_bg.wasm',
        kmsParams: 'assets/zama/kms_lib_bg.wasm'
      });
      await this.zamaInstanceService.initInstances();
    } catch (err) {
      console.error('FAILED TO INIT ZAMA SERVICES', err);
      throw err;
    } finally {
      this._sdkLoading$.next(false);
    }
  }

  public transfer(token: TokenAmount<EvmBlockchainName>, receiver: string): Promise<void> {
    return this.zamaSwapService
      .confidentialTransfer(token, receiver)
      .then(() => this.refreshBalancesAfterAction());
  }

  public unwrap(unwrapToken: TokenAmount<EvmBlockchainName>, receiver?: string): Promise<void> {
    return this.zamaSwapService
      .unwrap(unwrapToken, receiver)
      .then(() => this.refreshBalancesAfterAction());
  }

  public wrap(wrapToken: TokenAmount<EvmBlockchainName>, receiver?: string): Promise<void> {
    return this.zamaSwapService
      .wrap(wrapToken, receiver)
      .then(() => this.refreshBalancesAfterAction());
  }

  private async refreshBalancesAfterAction(): Promise<void> {
    await waitFor(2000);
    await this.zamaBalanceService.refreshBalances();
  }

  private async updateSignature(userAddress: string, blockchain: EvmBlockchainName): Promise<void> {
    if (!userAddress) {
      this.zamaSignatureService.resetSignature();
      return;
    }

    const signMessage = async () => {
      try {
        let chain = blockchain as ZamaSupportedChain;
        if (!ZAMA_SUPPORTED_CHAINS.includes(chain)) {
          chain = ZAMA_SUPPORTED_CHAINS[0];
          await this.walletConnectorService.switchChain(chain);
        }

        return this.zamaSignatureService.updateSignature(userAddress, chain);
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
          isSdkLoading$: this.sdkLoading$
        }
      })
    );
  }

  private initSubs(): void {
    const walletSub = this.subscribeOnAddressChanged().subscribe();

    this.subs.push(walletSub);
  }

  private subscribeOnAddressChanged(): Observable<void> {
    return this.walletConnectorService.addressChange$.pipe(
      distinctUntilChanged(),
      switchMap(userAddress =>
        from(
          this.updateSignature(
            userAddress,
            this.walletConnectorService.network as EvmBlockchainName
          ).then(() => this.zamaBalanceService.refreshBalances())
        )
      )
    );
  }

  public removeSubs(): void {
    this.subs.forEach(sub => sub.unsubscribe);
  }
}
