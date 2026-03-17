import { Injectable } from '@angular/core';
import { ZamaSwapService } from './zama-swap.service';
import { initSDK } from '@zama-fhe/relayer-sdk/web';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { BehaviorSubject } from 'rxjs';
import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';
import { ZamaInstanceService } from './zama-instance.service';
import { ZamaTokensService } from './zama-tokens.service';
import { ZamaBalanceService } from './zama-balance.service';
import { ZamaSignatureService } from './zama-signature.service';
import { waitFor } from '@cryptorubic/web3';
import { ZAMA_SUPPORTED_CHAINS, ZamaSupportedChain } from '../../constants/chains';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';

@Injectable()
export class ZamaFacadeService {
  private readonly _sdkLoading$ = new BehaviorSubject(false);

  public readonly sdkLoading$ = this._sdkLoading$.asObservable();

  constructor(
    private readonly zamaSwapService: ZamaSwapService,
    private readonly zamaInstanceService: ZamaInstanceService,
    private readonly zamaBalanceService: ZamaBalanceService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly zamaTokensService: ZamaTokensService,
    private readonly zamaSignatureService: ZamaSignatureService,
    private readonly notificationService: NotificationsService
  ) {}

  public async initServices(): Promise<void> {
    try {
      this._sdkLoading$.next(true);
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

  private showSuccessNotification(message: string): void {
    this.notificationService.show(message, {
      status: 'info',
      autoClose: 15_000,
      data: null,
      icon: '',
      defaultAutoCloseTime: 0
    });
  }

  public transfer(token: TokenAmount<EvmBlockchainName>, receiver: string): Promise<void> {
    return this.zamaSwapService.confidentialTransfer(token, receiver).then(isSuccess => {
      if (isSuccess) {
        this.showSuccessNotification(
          'Transaction sent. This may take a moment. Please keep Rubic App open'
        );
        this.refreshBalancesAfterAction();
      }
    });
  }

  public unwrap(unwrapToken: TokenAmount<EvmBlockchainName>, receiver?: string): Promise<void> {
    return this.zamaSwapService.unwrap(unwrapToken, receiver).then(isSuccess => {
      if (isSuccess) {
        this.showSuccessNotification(
          'Transaction sent. This may take a moment. Please keep Rubic App open'
        );
        this.refreshBalancesAfterAction();
      }
    });
  }

  public wrap(wrapToken: TokenAmount<EvmBlockchainName>, receiver?: string): Promise<void> {
    return this.zamaSwapService.wrap(wrapToken, receiver).then(isSuccess => {
      if (isSuccess) {
        this.showSuccessNotification('Transaction sent. 5-10 seconds on update balance');
        this.refreshBalancesAfterAction();
      }
    });
  }

  private async refreshBalancesAfterAction(): Promise<void> {
    await waitFor(2000);
    await this.zamaBalanceService.refreshBalances();
  }

  public async updateSignature(): Promise<void> {
    const address = this.walletConnectorService.address;
    if (!this.walletConnectorService.address) {
      this.notificationService.showWarning('Wallet not connected');
      return;
    }

    try {
      let chain = this.walletConnectorService.network as ZamaSupportedChain;
      if (!ZAMA_SUPPORTED_CHAINS.includes(chain)) {
        chain = ZAMA_SUPPORTED_CHAINS[0];
        await this.walletConnectorService.switchChain(chain);
      }

      await this.zamaSignatureService
        .updateSignature(address, chain)
        .then(isSuccess => isSuccess && this.zamaBalanceService.refreshBalances());
    } catch {}
  }
}
