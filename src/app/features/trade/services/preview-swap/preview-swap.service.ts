import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  firstValueFrom,
  forkJoin,
  from,
  interval,
  Observable,
  of,
  Subscription
} from 'rxjs';
import {
  combineLatestWith,
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  map,
  startWith,
  switchMap,
  takeWhile,
  tap
} from 'rxjs/operators';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { AssetSelector } from '@shared/models/asset-selector';
import { BLOCKCHAINS } from '@shared/constants/blockchain/ui-blockchains';
import { blockchainColor } from '@shared/constants/blockchain/blockchain-color';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { SwapsControllerService } from '@features/trade/services/swaps-controller/swaps-controller.service';
import { CrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import BigNumber from 'bignumber.js';
import {
  BlockchainName,
  CrossChainTradeType,
  EvmBlockchainName,
  TX_STATUS,
  Web3PublicSupportedBlockchain
} from 'rubic-sdk';
import { SdkService } from '@core/services/sdk/sdk.service';
import { TransactionState } from '@features/trade/models/transaction-state';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { AirdropPointsService } from '@shared/services/airdrop-points-service/airdrop-points.service';
import { UnreadTradesService } from '@core/services/unread-trades-service/unread-trades.service';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import { SelectedTrade } from '@features/trade/models/selected-trade';
import { ErrorsService } from '@core/errors/errors.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import {
  mevBotRpcAddresses,
  MevBotSupportedBlockchain,
  mevBotSupportedBlockchains
} from './models/mevbot-data';
import { compareObjects } from '@shared/utils/utils';
import { tuiIsPresent } from '@taiga-ui/cdk';
import { CrossChainSwapAdditionalParams } from './models/swap-controller-service-types';

interface TokenFiatAmount {
  tokenAmount: BigNumber;
  fiatAmount: string;
}

interface TradeInfo {
  fromAsset: AssetSelector;
  fromValue: TokenFiatAmount;
  toAsset: AssetSelector;
  toValue: TokenFiatAmount;
}

@Injectable()
export class PreviewSwapService {
  private readonly _transactionState$ = new BehaviorSubject<TransactionState>({
    step: 'inactive',
    data: {}
  });

  private readonly subscriptions$: Subscription[] = [];

  private useCallback = false;

  public get transactionState(): TransactionState {
    return this._transactionState$.getValue();
  }

  public readonly transactionState$ = this._transactionState$.asObservable();

  private readonly _selectedTradeState$ = new BehaviorSubject<SelectedTrade | null>(null);

  public readonly selectedTradeState$ = this._selectedTradeState$.asObservable();

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
    private readonly airdropPointsService: AirdropPointsService,
    private readonly recentTradesStoreService: UnreadTradesService,
    private readonly settingsService: SettingsService,
    private readonly errorsService: ErrorsService,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService
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

    if (tradeState.needApprove) {
      this.startApprove();
    } else {
      this.startSwap();
    }
  }

  public startSwap(): void {
    this.setNextTxState({ step: 'swapRequest', data: this.transactionState.data });
  }

  public startApprove(): void {
    this.setNextTxState({ step: 'approvePending', data: this.transactionState.data });
  }

  public activatePage(): void {
    this.resetTransactionState();
    this.subscribeOnNetworkChange();
    this.subscribeOnAddressChange();
    this.subscribeOnValidation();
    this.handleTransactionState();
  }

  public deactivatePage(): void {
    this.subscriptions$.forEach(sub => sub?.unsubscribe());
    this.subscriptions$.length = 0;
    this.useCallback = false;
    this._selectedTradeState$.next(null);
  }

  private handleTransactionState(): void {
    const transactionStateSubscription$ = this.transactionState$
      .pipe(
        filter(state => state.step !== 'inactive'),
        combineLatestWith(this.selectedTradeState$.pipe(first(tuiIsPresent))),
        distinctUntilChanged(
          ([prevTxState, prevTradeState], [nextTxState, nextTradeState]) =>
            prevTxState.step === nextTxState.step && compareObjects(prevTradeState, nextTradeState)
        ),
        debounceTime(10),
        switchMap(([txState, tradeState]) => {
          if (txState.step === 'approvePending') {
            return this.handleApprove(tradeState);
          }
          if (txState.step === 'swapRequest') {
            return this.makeSwapRequest(tradeState);
          }
          return of(null);
        })
      )
      .subscribe();

    this.subscriptions$.push(transactionStateSubscription$);
  }

  public initDstTxStatusPolling(
    srcHash: string,
    timestamp: number,
    toBlockchain: BlockchainName,
    additionalInfo: { changenowId?: string; rangoRequestId?: string }
  ): void {
    const pollingSubscription$ = interval(30_000)
      .pipe(
        startWith(-1),
        switchMap(() => this.selectedTradeState$.pipe(first())),
        switchMap(tradeState => {
          return from(
            this.sdkService.crossChainStatusManager.getCrossChainStatus(
              {
                fromBlockchain: tradeState.trade.from.blockchain as Web3PublicSupportedBlockchain,
                toBlockchain: tradeState.trade.to.blockchain,
                srcTxHash: srcHash,
                txTimestamp: timestamp,
                ...(additionalInfo?.changenowId && {
                  changenowId: additionalInfo.changenowId
                }),
                ...(additionalInfo.rangoRequestId && {
                  rangoRequestId: additionalInfo.rangoRequestId
                }),
                ...('amountOutMin' in tradeState.trade && {
                  amountOutMin: tradeState.trade.amountOutMin as string
                })
              },
              tradeState.tradeType as CrossChainTradeType
            )
          );
        }),
        tap(crossChainStatus => {
          if (crossChainStatus.dstTxStatus === TX_STATUS.SUCCESS) {
            this.setNextTxState({
              step: 'success',
              data: {
                hash: crossChainStatus.dstTxHash,
                toBlockchain
              }
            });
          } else if (crossChainStatus.dstTxStatus === TX_STATUS.FAIL) {
            this.setNextTxState({ step: 'error', data: this.transactionState.data });
          }
        }),
        takeWhile(crossChainStatus => crossChainStatus.dstTxStatus === TX_STATUS.PENDING)
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
    this._selectedTradeState$.next(this.swapsStateService.tradeState);
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

  private makeSwapRequest(tradeState: SelectedTrade): Observable<void> {
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
                  txHash = hash;
                  this.setNextTxState({
                    step: 'sourcePending',
                    data: { ...this.transactionState.data }
                  });
                }
              },
              onSwap: (additionalInfo?: CrossChainSwapAdditionalParams) => {
                if (this.useCallback) {
                  if (tradeState.trade instanceof CrossChainTrade) {
                    this.setNextTxState({
                      step: 'destinationPending',
                      data: { ...this.transactionState.data }
                    });
                    this.initDstTxStatusPolling(
                      txHash,
                      Date.now(),
                      tradeState.trade.to.blockchain,
                      additionalInfo
                    );
                  } else {
                    this.setNextTxState({
                      step: 'success',
                      data: {
                        hash: txHash,
                        toBlockchain: tradeState.trade.to.blockchain
                      }
                    });
                  }

                  this.airdropPointsService.updateSwapToEarnUserPointsInfo();
                  this.recentTradesStoreService.updateUnreadTrades();
                }
              },
              onError: () => {
                if (this.useCallback) {
                  this.setNextTxState({ step: 'inactive', data: {} });
                  this.tradePageService.setState('form');
                }
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
          this.setNextTxState({
            step: 'swapRequest',
            data: this.transactionState.data
          });
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

  private subscribeOnValidation(): void {
    const validationSubscription$ = this.selectedTradeState$.pipe(startWith()).subscribe(() => {
      this.checkAddress();
      this.checkNetwork();
    });
    this.subscriptions$.push(validationSubscription$);
  }

  private resetTransactionState(): void {
    this.setNextTxState({ step: 'idle', data: {} });
  }
}
