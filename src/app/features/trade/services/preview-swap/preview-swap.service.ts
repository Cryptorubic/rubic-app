import { Inject, Injectable, Injector } from '@angular/core';
import {
  BehaviorSubject,
  firstValueFrom,
  forkJoin,
  from,
  interval,
  Observable,
  of,
  Subject,
  Subscription
} from 'rxjs';
import {
  catchError,
  combineLatestWith,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  first,
  map,
  skip,
  startWith,
  switchMap,
  takeWhile,
  tap,
  timeout
} from 'rxjs/operators';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { AssetSelector } from '@shared/models/asset-selector';
import { BLOCKCHAINS } from '@shared/constants/blockchain/ui-blockchains';
import { blockchainColor } from '@shared/constants/blockchain/blockchain-color';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { SwapsControllerService } from '@features/trade/services/swaps-controller/swaps-controller.service';
import { TX_STATUS } from '@cryptorubic/web3';
import { SdkService } from '@core/services/sdk/sdk.service';
import { TransactionState } from '@features/trade/models/transaction-state';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { UnreadTradesService } from '@core/services/unread-trades-service/unread-trades.service';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import { SelectedTrade } from '@features/trade/models/selected-trade';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import {
  mevBotRpcAddresses,
  MevBotSupportedBlockchain,
  mevBotSupportedBlockchains
} from './models/mevbot-data';
import { ErrorsService } from '@app/core/errors/errors.service';
import { FallbackSwapError } from '@app/core/errors/models/provider/fallback-swap-error';
import { CrossChainApiService } from '../cross-chain-routing-api/cross-chain-api.service';
import { SpindlService } from '@app/core/services/spindl-ads/spindl.service';
import { ERROR_TYPE } from '@app/core/errors/models/error-type';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { TxRevertedInBlockchainError } from '@app/core/errors/models/common/tx-reverted-in-blockchain.error';
import { BLOCKCHAIN_NAME, BlockchainName, EvmBlockchainName } from '@cryptorubic/core';
import { CrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { SimulationFailedError } from '@app/core/errors/models/common/simulation-failed.error';
import { ModalService } from '@app/core/modals/services/modal.service';
import { TradeInfo } from '../../models/trade-info';
import { transactionStep, TransactionStep } from '../../models/transaction-steps';
import { RateChangeInfo } from '../../models/rate-change-info';
import { UserRejectError } from '@app/core/errors/models/provider/user-reject-error';

@Injectable()
export class PreviewSwapService {
  private readonly _transactionState$ = new BehaviorSubject<TransactionState>({
    step: 'inactive',
    data: {}
  });

  private readonly subscriptions$: Subscription[] = [];

  /*
   * used to change state of preview swap and redirect user back to form onError
   * onDestroy PreviewSwapComponent - it will prevent to unexpected side actions on UI
   */
  private useCallback = false;

  public get transactionState(): TransactionState {
    return this._transactionState$.getValue();
  }

  public readonly transactionState$ = this._transactionState$.asObservable();

  private readonly _selectedTradeState$ = new BehaviorSubject<SelectedTrade | null>(null);

  public readonly selectedTradeState$ = this._selectedTradeState$.asObservable();

  private readonly _isRetryModalOpen$ = new BehaviorSubject<boolean>(false);

  private _continueSwapTrigger$: Subject<boolean>;

  private get isRetryModalOpen(): boolean {
    return this._isRetryModalOpen$.getValue();
  }

  private set isRetryModalOpen(isOpen: boolean) {
    this._isRetryModalOpen$.next(isOpen);
  }

  public tradeInfo$: Observable<TradeInfo> = forkJoin([
    this.swapForm.fromToken$.pipe(first()),
    this.swapForm.fromAmount$.pipe(first()),
    this.swapForm.toToken$.pipe(first()),
    this.swapForm.toAmount$.pipe(first())
  ]).pipe(
    map(([fromToken, fromAmount, toToken, toAmount]) => {
      const fromAsset = this.getTokenAsset(fromToken);
      const fromValue = {
        tokenAmount: fromAmount.actualValue,
        fiatAmount:
          fromAmount.actualValue.gt(0) && fromToken.price
            ? fromAmount.actualValue.multipliedBy(fromToken.price || 0).toFixed(2)
            : null
      };

      const toAsset = this.getTokenAsset(toToken);
      const toValue = {
        tokenAmount: toAmount,
        fiatAmount:
          toAmount.gt(0) && toToken.price
            ? toAmount.multipliedBy(toToken.price || 0).toFixed(2)
            : null
      };

      return { fromAsset, fromValue, toAsset, toValue };
    })
  );

  constructor(
    private readonly swapsStateService: SwapsStateService,
    private readonly swapForm: SwapsFormService,
    private readonly swapsControllerService: SwapsControllerService,
    private readonly sdkService: SdkService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly tradePageService: TradePageService,
    private readonly recentTradesStoreService: UnreadTradesService,
    private readonly settingsService: SettingsService,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService,
    private readonly errorService: ErrorsService,
    private readonly ccrApiService: CrossChainApiService,
    private readonly spindlService: SpindlService,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  private getTokenAsset(token: TokenAmount): AssetSelector {
    const blockchain = BLOCKCHAINS[token.blockchain];
    const color = blockchainColor[token.blockchain];

    return {
      secondImage: blockchain.img,
      secondLabel: blockchain.name,
      mainImage: token.image,
      mainLabel: token.symbol,
      secondColor: color
    };
  }

  public setNextTxState(state: TransactionState): void {
    this._transactionState$.next(state);
  }

  public async requestTxSign(): Promise<void> {
    const tradeState = await firstValueFrom(this.selectedTradeState$);
    if (tradeState.needAuthWallet) {
      this.startAuthWallet();
    } else if (tradeState.needApprove) {
      this.startApprove();
    } else {
      this.startSwap();
    }
  }

  public startSwap(): void {
    this.setNextTxState({ step: 'swapRequest', data: this.transactionState.data });
  }

  public startAuthWallet(): void {
    this.setNextTxState({ step: 'authWalletPending', data: this.transactionState.data });
  }

  public startApprove(): void {
    this.setNextTxState({ step: 'approvePending', data: this.transactionState.data });
  }

  public backToForm(): void {
    this.continueBackupSwap(false);

    this.swapsStateService.resetBackupTrades();
    this.tradePageService.setState('form');
  }

  public handleTrustline(): void {
    const currState = this.transactionState;

    const nextState: TransactionState = {
      ...currState,
      data: {
        ...currState.data,
        needTrustlineOptions: {
          needTrustlineAfterSwap: false,
          needTrustlineBeforeSwap: false
        }
      },
      ...(currState.data.needTrustlineOptions?.needTrustlineAfterSwap && {
        step: transactionStep.trustlineReady
      })
    };
    this.setNextTxState(nextState);
  }

  public activatePage(): void {
    this.resetTransactionState();
    this.subscribeOnNetworkChange();
    this.subscribeOnAddressChange();
    this.subscribeOnValidation();
    this.handleTransactionState();
    this.handleRetryModal();
  }

  public activateDepositPage(): void {
    this.resetTransactionState();
    this.subscribeOnDepositValidation();
  }

  public deactivatePage(): void {
    this.subscriptions$.forEach(sub => sub?.unsubscribe());
    this.subscriptions$.length = 0;
    this.useCallback = false;
    this._selectedTradeState$.next(null);
  }

  private handleRetryModal(): void {
    const retryModalSubscription$ = this._isRetryModalOpen$
      .pipe(
        skip(1),
        distinctUntilChanged(),
        switchMap(isOpen => {
          if (isOpen) {
            return this.modalService
              .openSwapRetryPendingModal(
                this.swapsStateService.backupTrades.length,
                this.swapsStateService.backupTradesCount$,
                this.injector
              )
              .pipe(map(() => of(true)));
          }
          return of(false);
        }),
        tap(isManualClose => {
          this.modalService.closeSwapRetryModal();
          if (isManualClose) {
            this.backToForm();
          }
        })
      )
      .subscribe();

    this.subscriptions$.push(retryModalSubscription$);
  }

  public continueBackupSwap(allowedToContinue: boolean): void {
    this._continueSwapTrigger$?.next(allowedToContinue);
  }

  private handleTransactionState(): void {
    let retriesCount: number = 0;
    const transactionStateSubscription$ = this.transactionState$
      .pipe(
        filter(state => state.step !== 'inactive'),
        combineLatestWith(this.selectedTradeState$),
        distinctUntilChanged(([prevTxState, prevTradeState], [nextTxState, nextTradeState]) => {
          return (
            prevTxState.step === nextTxState.step &&
            prevTxState.level === nextTxState.level &&
            prevTradeState.tradeType === nextTradeState.tradeType
          );
        }),
        debounceTime(10),
        switchMap(([txState, tradeState]) => {
          retriesCount = txState.level ? retriesCount : 0;
          if (txState.step === 'approvePending') {
            return this.handleApprove(tradeState);
          }
          if (txState.step === 'authWalletPending') {
            return this.handleAuthMessage(tradeState);
          }
          if (txState.step === 'swapRequest') {
            return this.makeSwapRequest(tradeState, txState.step);
          }
          if (txState.step === 'swapRetry' && txState.level !== retriesCount) {
            retriesCount = txState.level;
            return this.tryRetrySwap(tradeState, txState.step);
          }

          if (txState.step === 'trustlineReady') {
            this.setNextTxState({
              step: 'destinationPending',
              data: { ...this.transactionState.data }
            });
          }

          return of(null);
        })
      )
      .subscribe();

    this.subscriptions$.push(transactionStateSubscription$);
  }

  public initDstTxStatusPolling(srcHash: string, toBlockchain: BlockchainName): void {
    const intervalMS =
      this.swapForm.inputValue.fromBlockchain === BLOCKCHAIN_NAME.BITCOIN ? 300_000 : 30_000;

    const pollingSubscription$ = interval(intervalMS)
      .pipe(
        startWith(-1),
        switchMap(() => this.selectedTradeState$.pipe(first())),
        switchMap(tradeState => {
          return from(
            this.sdkService.crossChainStatusManager.getCrossChainStatusExtended(
              (tradeState.trade as CrossChainTrade).rubicId,
              srcHash,
              tradeState.trade.from.blockchain
            )
          ).pipe(
            timeout(29_000),
            catchError(() => {
              return of({
                srcTxStatus: TX_STATUS.SUCCESS,
                dstTxStatus: TX_STATUS.PENDING,
                dstTxHash: null
              });
            })
          );
        }),
        tap(crossChainStatus => {
          if (
            crossChainStatus.dstTxStatus === TX_STATUS.WAITING_FOR_TRUSTLINE &&
            this.transactionState.step !== transactionStep.trustlineReady
          ) {
            this.setNextTxState({
              step: 'trustlinePending',
              data: { ...this.transactionState.data }
            });
          }
          if (crossChainStatus.dstTxStatus === TX_STATUS.SUCCESS) {
            this.setNextTxState({
              step: 'success',
              data: {
                hash: crossChainStatus.dstTxHash,
                toBlockchain
              }
            });
          } else if (crossChainStatus.dstTxStatus === TX_STATUS.FALLBACK) {
            if (crossChainStatus.dstTxHash) {
              this.setNextTxState({
                step: 'success',
                data: {
                  hash: crossChainStatus.dstTxHash,
                  toBlockchain
                }
              });
            } else {
              this.setNextTxState({ step: 'error', data: this.transactionState.data });
            }
            this.errorService.catch(new FallbackSwapError());
            if (crossChainStatus.extraInfo?.mesonSwapId) {
              this.ccrApiService.sendMesonSwapId(crossChainStatus, srcHash);
            }
          } else if (
            crossChainStatus.dstTxStatus === TX_STATUS.FAIL ||
            crossChainStatus.dstTxStatus === TX_STATUS.WAITING_FOR_REFUND_TRUSTLINE
          ) {
            this.setNextTxState({ step: 'error', data: this.transactionState.data });
          }
        }),
        takeWhile(
          crossChainStatus =>
            crossChainStatus.dstTxStatus === TX_STATUS.PENDING ||
            crossChainStatus.dstTxStatus === TX_STATUS.WAITING_FOR_TRUSTLINE
        )
      )
      .subscribe();
    this.subscriptions$.push(pollingSubscription$);
  }

  private subscribeOnNetworkChange(): void {
    const networkChangeSubscription$ = this.walletConnectorService.networkChange$.subscribe(
      network => this.checkNetwork(network)
    );
    this.subscriptions$.push(networkChangeSubscription$);
  }

  private subscribeOnAddressChange(): void {
    const addressChangeSubscription$ = this.walletConnectorService.addressChange$.subscribe(
      address => this.checkAddress(address)
    );
    this.subscriptions$.push(addressChangeSubscription$);
  }

  private checkAddress(address: string = this.walletConnectorService.address): void {
    const state = this._transactionState$.getValue();
    state.data.activeWallet = Boolean(address);
    this.setNextTxState(state);
  }

  private checkNetwork(network: BlockchainName = this.walletConnectorService.network): void {
    const selectedTrade = this._selectedTradeState$.value;
    const tokenBlockchain = selectedTrade?.trade?.from?.blockchain;
    const state = this._transactionState$.getValue();
    state.data.wrongNetwork = Boolean(tokenBlockchain) && network !== tokenBlockchain;
    this.setNextTxState(state);
  }

  private checkTrustline(): void {
    const selectedTrade = this._selectedTradeState$.value;
    const state = this._transactionState$.getValue();
    state.data.needTrustlineOptions = selectedTrade.needTrustlineOptions;
    this.setNextTxState(state);
  }

  private async loadRpcParams(useCustomRpc: boolean): Promise<boolean> {
    const tradeState = await firstValueFrom(this.selectedTradeState$);
    const fromBlockchain = tradeState.trade.from.blockchain as EvmBlockchainName;
    const isMevBotSupported = mevBotSupportedBlockchains.some(
      mevBotChain => mevBotChain === fromBlockchain
    );

    if (useCustomRpc && isMevBotSupported) {
      const rpc = mevBotRpcAddresses[fromBlockchain as MevBotSupportedBlockchain];

      try {
        await this.walletConnectorService.addChain(fromBlockchain, rpc);
        return true;
      } catch {
        return false;
      }
    }

    return true;
  }

  public setSelectedProvider(): void {
    this.swapsStateService.setBackupsForTrade(this.swapsStateService.tradeState);
    this._selectedTradeState$.next(this.swapsStateService.tradeState);
  }

  public tryRetrySwap(prevState: SelectedTrade, txStep: TransactionStep): Observable<void> {
    this.swapsStateService.updateBackups(prevState);
    const backupTrade = this.swapsStateService.selectNextBackupTrade();

    if (backupTrade) {
      this.isRetryModalOpen = true;
      this._selectedTradeState$.next(backupTrade);
      return this.makeSwapRequest(backupTrade, txStep);
    } else {
      this.closeRetryModal();
      return this.modalService
        .openAllSwapBackupsFailedModal()
        .pipe(finalize(() => this.backToForm()));
    }
  }

  public closeRetryModal(): void {
    if (this.isRetryModalOpen) {
      this.isRetryModalOpen = false;
    }
  }

  private async catchSwitchCancel(): Promise<void> {
    const warningText = this.translateService.instant('notifications.cancelRpcSwitch');
    this.notificationsService.show(warningText, {
      status: 'warning',
      autoClose: true,
      data: null,
      icon: '',
      defaultAutoCloseTime: 0
    });
    this.resetTransactionState();
  }

  private makeSwapRequest(tradeState: SelectedTrade, txStep: TransactionStep): Observable<void> {
    let txHash: string;
    this.useCallback = true;
    const useMevProtection =
      tradeState.trade.from.blockchain === tradeState.trade.to.blockchain
        ? this.settingsService.instantTradeValue.useMevBotProtection
        : this.settingsService.crossChainRoutingValue.useMevBotProtection;

    return from(this.loadRpcParams(useMevProtection)).pipe(
      debounceTime(50),
      switchMap(rpcChanged => {
        return rpcChanged
          ? this.swapsControllerService.swap(tradeState, {
              onHash: (hash: string) => {
                if (this.useCallback) {
                  this.closeRetryModal();
                  txHash = hash;
                  this.setNextTxState({
                    step: 'sourcePending',
                    data: { ...this.transactionState.data }
                  });
                }
              },
              onSwap: () => {
                // @TODO Refactor
                if (this.useCallback) {
                  this.closeRetryModal();
                  if (tradeState.trade instanceof CrossChainTrade) {
                    if (!tradeState.needTrustlineOptions?.needTrustlineAfterSwap) {
                      this.setNextTxState({
                        step: 'destinationPending',
                        data: { ...this.transactionState.data }
                      });
                    }

                    this.initDstTxStatusPolling(txHash, tradeState.trade.to.blockchain);
                  } else {
                    this.setNextTxState({
                      step: 'success',
                      data: {
                        hash: txHash,
                        toBlockchain: tradeState.trade.to.blockchain
                      }
                    });
                  }
                }

                this.spindlService.sendSwapEvent(txHash);
                this.recentTradesStoreService.updateUnreadTrades();
              },
              onError: (err: RubicError<ERROR_TYPE> | null) => {
                if (this.useCallback) {
                  if (err instanceof SimulationFailedError) {
                    this.setNextTxState({
                      step: 'swapRetry',
                      data: this.transactionState.data,
                      level: (this.transactionState.level ?? 0) + 1
                    });
                  } else if (err instanceof TxRevertedInBlockchainError) {
                    this.closeRetryModal();
                    this.setNextTxState({ step: 'error', data: this.transactionState.data });
                  } else if (!(err instanceof UserRejectError && !err.showAlert)) {
                    this.closeRetryModal();
                    this.setNextTxState({ step: 'inactive', data: {} });
                    this.tradePageService.setState('form');
                  }
                }
              },
              onSimulationSuccess: () => {
                if (txStep === 'swapRequest') return Promise.resolve(true);

                this._continueSwapTrigger$ = new Subject<boolean>();
                this.setNextTxState({
                  step: 'swapBackupSelected',
                  data: this.transactionState.data
                });
                this.closeRetryModal();

                return firstValueFrom(this._continueSwapTrigger$);
              },
              onRateChange: (rateChangeInfo: RateChangeInfo) => {
                return txStep === 'swapRequest'
                  ? firstValueFrom(this.modalService.openRateChangedModal(rateChangeInfo))
                  : this.modalService.openSwapRetryProviderSelectModal(
                      tradeState,
                      this.tradeInfo$,
                      rateChangeInfo,
                      this.injector
                    );
              }
            })
          : this.catchSwitchCancel();
      })
    );
  }

  private handleApprove(tradeState: SelectedTrade): Promise<void> {
    this.useCallback = true;
    return this.swapsControllerService.approve(tradeState, {
      onSwap: () => {
        if (this.useCallback) {
          this.startSwap();
        }
      },
      onError: () => {
        if (this.useCallback) {
          this.setNextTxState({
            step: 'approveReady',
            data: this.transactionState.data
          });
        }
      }
    });
  }

  private handleAuthMessage(tradeState: SelectedTrade): Promise<void> {
    this.useCallback = true;
    return this.swapsControllerService.authWallet(tradeState, {
      onSwap: () => {
        if (this.useCallback) {
          this.startSwap();
        }
      },
      onError: () => {
        if (this.useCallback) {
          this.setNextTxState({
            step: 'authWalletReady',
            data: this.transactionState.data
          });
        }
      }
    });
  }

  private subscribeOnValidation(): void {
    const validationSubscription$ = this.selectedTradeState$.pipe(startWith()).subscribe(() => {
      this.checkAddress();
      this.checkNetwork();
      this.checkTrustline();
    });
    this.subscriptions$.push(validationSubscription$);
  }

  private subscribeOnDepositValidation(): void {
    const validationSubscription$ = this.selectedTradeState$.pipe(startWith()).subscribe(() => {
      this.checkTrustline();
    });
    this.subscriptions$.push(validationSubscription$);
  }

  private resetTransactionState(): void {
    this.setNextTxState({ step: 'idle', data: {} });
  }
}
