import { Injectable } from '@angular/core';
import { ZamaSwapService } from './zama-swap.service';
import { initSDK } from '@zama-fhe/relayer-sdk/web';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { BehaviorSubject, combineLatest, distinctUntilChanged, Subscription } from 'rxjs';
import { EvmBlockchainName, TokenAmount } from '@cryptorubic/core';
import { ZamaInstanceService } from './zama-instance.service';
import { ZamaTokensService } from './zama-tokens.service';
import { ZamaBalanceService } from './zama-balance.service';
import { ZamaSignatureService } from './zama-signature.service';
import { waitFor } from '@cryptorubic/web3';
import { ZAMA_SUPPORTED_CHAINS, ZamaSupportedChain } from '../../constants/chains';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { PrivateStep } from '../../../shared-privacy-providers/components/private-preview-swap/models/preview-swap-options';
import { TransactionReceipt } from 'viem';
import { PrivatePageTypeService } from '../../../shared-privacy-providers/services/private-page-type/private-page-type.service';
import { ZAMA_PAGES } from '../../constants/zama-pages';
import { PrivateLocalStorageService } from '@app/features/privacy/services/privacy-local-storage.service';
import { PRIVATE_TRADE_TYPE } from '@app/features/privacy/constants/private-trade-types';
import { PrivateStatisticsService } from '../../../shared-privacy-providers/services/private-statistics/private-statistics.service';

@Injectable()
export class ZamaFacadeService {
  private readonly _sdkLoading$ = new BehaviorSubject(false);

  public readonly sdkLoading$ = this._sdkLoading$.asObservable();

  private readonly subs: Subscription[] = [];

  constructor(
    private readonly zamaSwapService: ZamaSwapService,
    private readonly zamaInstanceService: ZamaInstanceService,
    private readonly zamaBalanceService: ZamaBalanceService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly zamaTokensService: ZamaTokensService,
    private readonly zamaSignatureService: ZamaSignatureService,
    private readonly notificationService: NotificationsService,
    private readonly privatePageTypeService: PrivatePageTypeService,
    private readonly privateLocalStorageService: PrivateLocalStorageService,
    private readonly privateStatisticsService: PrivateStatisticsService
  ) {}

  public async initServices(): Promise<void> {
    try {
      this._sdkLoading$.next(true);
      await this.zamaTokensService.initTokensMapping();
      this.initSubs();
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

  private initSubs(): void {
    const signatureSub = this.subscribeOnSignatureChanged();

    this.subs.push(signatureSub);
  }

  public removeSubs(): void {
    this.subs.forEach(sub => sub.unsubscribe());
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

  private addSwitchNetworkStep(fromBlockchain: EvmBlockchainName, steps: PrivateStep[]): void {
    if (fromBlockchain !== this.walletConnectorService.network) {
      steps.push({
        label: 'Switch network',
        action: () => this.walletConnectorService.switchChain(fromBlockchain)
      });
    }
  }

  public async prepareTransferSteps(
    token: TokenAmount<EvmBlockchainName>,
    receiver: string
  ): Promise<PrivateStep[]> {
    const steps: PrivateStep[] = [];

    this.addSwitchNetworkStep(token.blockchain, steps);

    steps.push({
      label: 'Transfer',
      action: () =>
        this.zamaSwapService.confidentialTransfer(token, receiver).then(isSuccess => {
          this.privateStatisticsService.saveAction(
            'TRANSFER',
            'ZAMA',
            this.walletConnectorService.address,
            token.address,
            token.weiAmount.toFixed(),
            token.blockchain
          );

          if (isSuccess) {
            this.showSuccessNotification(
              'Transaction sent. This may take a moment. Please keep Rubic App open'
            );
            this.refreshBalancesAfterAction();
          }
        })
    });
    return steps;
  }

  public async prepareWrapSteps(wrapToken: TokenAmount<EvmBlockchainName>): Promise<PrivateStep[]> {
    const steps: PrivateStep[] = [];

    this.addSwitchNetworkStep(wrapToken.blockchain, steps);

    const pureTokenAmount = await this.zamaSwapService.getPureTokenAmount(wrapToken);
    const needApprove = await this.zamaSwapService.needApprove(pureTokenAmount);

    if (needApprove) {
      steps.push({
        label: 'Approve',
        action: () => this.zamaSwapService.approve(pureTokenAmount)
      });
    }

    steps.push({
      label: 'Shield',
      action: () =>
        this.zamaSwapService.wrap(wrapToken).then(isSuccess => {
          this.privateStatisticsService.saveAction(
            'SHIELD',
            'ZAMA',
            this.walletConnectorService.address,
            wrapToken.address,
            wrapToken.weiAmount.toFixed(),
            wrapToken.blockchain
          );
          if (isSuccess) {
            this.showSuccessNotification('Transaction sent. 5-10 seconds on update balance');
            this.refreshBalancesAfterAction();
            this.privateLocalStorageService.markProviderAsShielded(PRIVATE_TRADE_TYPE.ZAMA);
          }
        })
    });

    return steps;
  }

  public async prepareUnwrapSteps(
    unwrapToken: TokenAmount<EvmBlockchainName>,
    receiver?: string
  ): Promise<PrivateStep[]> {
    const steps: PrivateStep[] = [];

    this.addSwitchNetworkStep(unwrapToken.blockchain, steps);

    let unwrapReceipt: TransactionReceipt;

    const onUnwrapSuccess = (receipt: TransactionReceipt) => {
      unwrapReceipt = receipt;
    };

    steps.push({
      label: 'Unshield',
      action: () => this.zamaSwapService.unwrap(unwrapToken, receiver, onUnwrapSuccess)
    });

    steps.push({
      label: 'Finalize unshield',
      action: () =>
        this.zamaSwapService.finalizeUnwrap(unwrapToken, unwrapReceipt).then(isSuccess => {
          this.privateStatisticsService.saveAction(
            'UNSHIELD',
            'ZAMA',
            this.walletConnectorService.address,
            unwrapToken.address,
            unwrapToken.weiAmount.toFixed(),
            unwrapToken.blockchain
          );

          if (isSuccess) {
            this.showSuccessNotification(
              'Transaction sent. This may take a moment. Please keep Rubic App open'
            );
            this.refreshBalancesAfterAction();
          }
        })
    });
    return steps;
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

      await this.zamaSignatureService.updateSignature(address, chain).then(isSuccess => {
        if (isSuccess) {
          this.privatePageTypeService.activePage = ZAMA_PAGES.find(page => page.type === 'hide');
        }
      });
    } catch {}
  }

  private subscribeOnSignatureChanged(): Subscription {
    return combineLatest([
      this.zamaSignatureService.signatureInfo$,
      this.zamaInstanceService.currInstance$
    ])
      .pipe(distinctUntilChanged())
      .subscribe(([signature]) => {
        if (signature) {
          this.zamaBalanceService.refreshBalances();
        } else {
          this.zamaBalanceService.clearBalances();
        }
      });
  }
}
