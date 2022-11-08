import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';
import {
  BlockchainName,
  compareAddresses,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainIsUnavailableError,
  CrossChainManagerCalculationOptions,
  CrossChainProvider,
  CrossChainTrade,
  CrossChainTradeType,
  LifiCrossChainTrade,
  LowSlippageError,
  MaxAmountError,
  MinAmountError,
  NotWhitelistedProviderError,
  RangoCrossChainTrade,
  RubicSdkError,
  SwapTransactionOptions,
  TooLowAmountError,
  UnsupportedReceiverAddressError,
  NotSupportedTokensError,
  ViaCrossChainTrade,
  Web3Pure,
  WrappedCrossChainTrade,
  LifiBridgeTypes,
  RangoBridgeTypes
} from 'rubic-sdk';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import { Inject, Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';

import { SmartRouting } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/smart-routing.interface';
import CrossChainIsUnavailableWarning from '@core/errors/models/cross-chain-routing/cross-chainIs-unavailable-warning';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { BehaviorSubject, from, Observable, of, Subscription } from 'rxjs';
import { IframeService } from '@core/services/iframe/iframe.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';
import { RecentTrade } from '@app/shared/models/my-trades/recent-trades.interface';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { TuiDialogService } from '@taiga-ui/core';
import { SwapSchemeModalComponent } from '../../components/swap-scheme-modal/swap-scheme-modal.component';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { HeaderStore } from '@app/core/header/services/header.store';
import { SwapSchemeModalData } from '../../models/swap-scheme-modal-data.interface';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { shouldCalculateGas } from '@shared/models/blockchain/should-calculate-gas';
import { GasService } from '@core/services/gas-service/gas.service';
import { RubicError } from '@core/errors/models/rubic-error';
import { AuthService } from '@core/services/auth/auth.service';
import { Token } from '@shared/models/tokens/token';
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { TRADES_PROVIDERS } from '@shared/constants/common/trades-providers';
import { CrossChainProviderTrade } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-provider-trade';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { ProvidersListSortingService } from '@features/swaps/features/cross-chain-routing/services/providers-list-sorting-service/providers-list-sorting.service';
import { TargetNetworkAddressService } from '@features/swaps/shared/target-network-address/services/target-network-address.service';
import { PlatformConfigurationService } from '@app/core/services/backend/platform-configuration/platform-configuration.service';
import BlockchainIsUnavailableWarning from '@app/core/errors/models/common/blockchain-is-unavailable.warning';
import { blockchainLabel } from '@app/shared/constants/blockchain/blockchain-label';
import { CrossChainRoutingApiService } from '@app/core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';

export type AllProviders = {
  readonly totalAmount: number;
  readonly data: ReadonlyArray<WrappedCrossChainTrade & { rank: number }>;
};

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingService extends TradeService {
  private readonly _selectedProvider$ = new BehaviorSubject<CrossChainTradeType | null>(null);

  public setSelectedProvider(type: CrossChainTradeType): void {
    this._selectedProvider$.next(type);
  }

  public readonly selectedProvider$ = this._selectedProvider$.asObservable();

  private readonly _allProviders$ = new BehaviorSubject<AllProviders>({ totalAmount: 0, data: [] });

  public readonly allProviders$ = this._allProviders$.asObservable().pipe(
    debounceTime(100),
    distinctUntilChanged((prev, curr) => prev.data.length === curr.data.length)
  );

  private readonly defaultTimeout = 25_000;

  private _crossChainTrade: CrossChainTrade;

  public set crossChainTrade(value: CrossChainTrade) {
    this._crossChainTrade = value;
  }

  public get crossChainTrade(): CrossChainTrade {
    return this._crossChainTrade;
  }

  private get receiverAddress(): string | null {
    if (!this.settingsService.crossChainRoutingValue.showReceiverAddress) {
      return null;
    }
    return this.targetNetworkAddressService.address;
  }

  private readonly _dangerousProviders$ = new BehaviorSubject<CrossChainTradeType[]>([]);

  public readonly dangerousProviders$ = this._dangerousProviders$.asObservable();

  public get dangerousProviders(): CrossChainTradeType[] {
    return this._dangerousProviders$.getValue();
  }

  public readonly providers$ = this.allProviders$.pipe(
    map(allProviders => {
      const providers = allProviders.data;
      const trades = [...providers].filter(provider => Boolean(provider.trade));
      return trades;
    }),
    debounceTime(10)
  );

  constructor(
    private readonly sdk: RubicSdkService,
    private readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService,
    private readonly iframeService: IframeService,
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly headerStore: HeaderStore,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly gasService: GasService,
    private readonly authService: AuthService,
    private readonly queryParamsService: QueryParamsService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly crossChainRoutingApiService: CrossChainRoutingApiService
  ) {
    super('cross-chain-routing');
  }

  public isSupportedBlockchain(blockchain: BlockchainName): boolean {
    return Object.values(this.sdk.crossChain.tradeProviders).some((provider: CrossChainProvider) =>
      provider.isSupportedBlockchain(blockchain)
    );
  }

  public areSupportedBlockchains(
    fromBlockchain: BlockchainName,
    toBlockchain: BlockchainName
  ): boolean {
    return Object.values(this.sdk.crossChain.tradeProviders).some((provider: CrossChainProvider) =>
      provider.areSupportedBlockchains(fromBlockchain, toBlockchain)
    );
  }

  public markProviderAsDangerous(type: CrossChainTradeType): void {
    this._dangerousProviders$.next([...this._dangerousProviders$.value, type]);
  }

  public unmarkProviderAsDangerous(type: CrossChainTradeType): void {
    const providers = this._dangerousProviders$.value.filter(providerType => providerType !== type);
    this._dangerousProviders$.next(providers);
  }

  public unmarkAllDangerousProviders(): void {
    this.dangerousProviders.forEach(tradeType => this.unmarkProviderAsDangerous(tradeType));
  }

  public calculateTrade(
    userAuthorized: boolean,
    isViaDisabled: boolean
  ): Observable<CrossChainProviderTrade> {
    try {
      const { fromToken, fromAmount, toToken } = this.swapFormService.inputValue;

      const slippageTolerance = this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
      const receiverAddress = this.receiverAddress;
      const { disabledCrossChainProviders, disabledBridgeTypes } =
        this.platformConfigurationService.disabledProviders;
      const disabledProvidersForLandingIframe = this.queryParamsService.disabledProviders;
      const disabledProviders = Array.from(
        new Set([
          ...(isViaDisabled ? [CROSS_CHAIN_TRADE_TYPE.VIA] : []),
          ...(disabledCrossChainProviders || []),
          ...(disabledProvidersForLandingIframe || [])
        ])
      ) as CrossChainTradeType[];
      const options: CrossChainManagerCalculationOptions = {
        fromSlippageTolerance: slippageTolerance / 2,
        toSlippageTolerance: slippageTolerance / 2,
        slippageTolerance,
        timeout: this.defaultTimeout,
        disabledProviders,
        lifiDisabledBridgeTypes: disabledBridgeTypes?.[
          CROSS_CHAIN_TRADE_TYPE.LIFI
        ] as LifiBridgeTypes[],
        rangoDisabledBridgeTypes: disabledBridgeTypes?.[
          CROSS_CHAIN_TRADE_TYPE.RANGO
        ] as RangoBridgeTypes[],
        ...(receiverAddress && { receiverAddress })
      };

      return this.sdk.crossChain
        .calculateTradesReactively(fromToken, fromAmount.toString(), toToken, options)
        .pipe(
          tap(tradeData => {
            if ((tradeData.trades[0]?.error as NotWhitelistedProviderError)?.providerRouter) {
              console.error(
                'Provider router:',
                (tradeData.trades[0]?.error as NotWhitelistedProviderError)?.providerRouter
              );
            }
            const rankedProviders = [...tradeData.trades].map(trade => ({
              ...trade,
              rank: this._dangerousProviders$.value.includes(trade.tradeType) ? 0 : 1
            }));
            const sortedProviders = ProvidersListSortingService.sortTrades(rankedProviders);
            this._allProviders$.next({
              totalAmount: tradeData.total,
              data: sortedProviders
            });
          }),
          switchMap(tradeData => {
            const bestProvider = this._selectedProvider$.value
              ? tradeData.trades.find(
                  provider => provider.tradeType === this._selectedProvider$.value
                )
              : this._allProviders$.value.data[0];
            const trade = bestProvider?.trade;

            if (!trade) {
              return of({
                ...bestProvider,
                needApprove: false,
                totalProviders: tradeData.total,
                currentProviders: tradeData.calculated,
                smartRouting: null
              });
            }

            return from(
              userAuthorized && trade?.needApprove ? from(trade.needApprove()) : of(false)
            ).pipe(
              map(needApprove => {
                const smartRouting = this.calculateSmartRouting(bestProvider);
                return {
                  ...bestProvider,
                  needApprove,
                  totalProviders: tradeData.total,
                  currentProviders: tradeData.calculated,
                  smartRouting
                };
              })
            );
          })
        );
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  public async createTrade(
    providerTrade: CrossChainProviderTrade,
    confirmCallback?: () => void
  ): Promise<void> {
    const fromBlockchain = providerTrade.trade.from.blockchain;
    const toBlockchain = providerTrade.trade.to.blockchain;
    if (!this.platformConfigurationService.isAvailableBlockchain(fromBlockchain)) {
      throw new BlockchainIsUnavailableWarning(blockchainLabel[fromBlockchain]);
    }
    if (!this.platformConfigurationService.isAvailableBlockchain(toBlockchain)) {
      throw new BlockchainIsUnavailableWarning(blockchainLabel[toBlockchain]);
    }

    if (!providerTrade?.trade) {
      throw new RubicError('Cross chain trade object not found.');
    }
    this.checkDeviceAndShowNotification();

    const form = this.swapFormService.inputValue;
    const fromAddress = this.authService.userAddress;

    const onTransactionHash = (txHash: string) => {
      confirmCallback?.();

      const fromToken = compareAddresses(providerTrade.trade?.from.address, form.fromToken.address)
        ? form.fromToken
        : (providerTrade.trade?.from as unknown as Token); // @TODO change types
      const toToken = compareAddresses(providerTrade?.trade?.to.address, form.toToken.address)
        ? form.toToken
        : (providerTrade.trade?.to as unknown as Token); // @TODO change types

      const timestamp = Date.now();

      const tradeData: RecentTrade = {
        srcTxHash: txHash,
        fromBlockchain: providerTrade.trade.from?.blockchain,
        toBlockchain: providerTrade.trade.to?.blockchain,
        fromToken,
        toToken,
        crossChainProviderType: providerTrade.tradeType,
        timestamp,
        bridgeType:
          providerTrade.trade instanceof LifiCrossChainTrade ||
          providerTrade.trade instanceof ViaCrossChainTrade ||
          providerTrade.trade instanceof RangoCrossChainTrade
            ? providerTrade.trade?.bridgeType
            : undefined,
        viaUuid:
          providerTrade.trade instanceof ViaCrossChainTrade ? providerTrade.trade.uuid : undefined,
        rangoRequestId:
          providerTrade.trade instanceof RangoCrossChainTrade
            ? providerTrade.trade.requestId
            : undefined,
        amountOutMin: providerTrade.trade.toTokenAmountMin.toFixed()
      };

      if (providerTrade.smartRouting) {
        this.openSwapSchemeModal(providerTrade, txHash, timestamp);
      }

      this.recentTradesStoreService.saveTrade(fromAddress, tradeData);

      this.notifyGtmAfterSignTx(txHash);
    };

    const blockchain = providerTrade.trade?.from?.blockchain;
    const shouldCalculateGasPrice = shouldCalculateGas[blockchain];

    const receiverAddress = this.receiverAddress;
    const swapOptions: SwapTransactionOptions = {
      onConfirm: onTransactionHash,
      ...(receiverAddress && { receiverAddress })
    };
    if (shouldCalculateGasPrice) {
      const gasPrice = await this.gasService.getGasPriceInEthUnits(blockchain);
      swapOptions.gasPrice = Web3Pure.toWei(gasPrice);
    }

    await providerTrade.trade.swap(swapOptions);

    this.showSuccessTrxNotification(providerTrade.tradeType);
  }

  // /**
  //  * Gets trade info to show in transaction info panel.
  //  */
  // public getTradeInfo(): Promise<> {
  //   if (!this._crossChainTrade) {
  //     return null;
  //   }
  //
  //   const trade = this._crossChainTrade;
  //   const { estimatedGas } = trade as EvmCrossChainTrade;
  //
  //   if (
  //     trade instanceof SymbiosisCrossChainTrade ||
  //     trade instanceof LifiCrossChainTrade ||
  //     trade instanceof DebridgeCrossChainTrade ||
  //     trade instanceof ViaCrossChainTrade ||
  //     trade instanceof RangoCrossChainTrade ||
  //     trade instanceof EvmBridgersCrossChainTrade ||
  //     trade instanceof TronBridgersCrossChainTrade ||
  //     trade instanceof MultichainCrossChainTrade
  //   ) {
  //     return {
  //       estimatedGas,
  //       feeAmount: new BigNumber(1),
  //       feeTokenSymbol: 'USDC',
  //       feePercent: trade.feeInfo.platformFee?.percent || 0,
  //       priceImpact: trade.priceImpact ? String(trade.priceImpact) : '0',
  //       networkFee: new BigNumber(trade.feeInfo.cryptoFee?.amount),
  //       networkFeeSymbol: trade.feeInfo.cryptoFee?.tokenSymbol
  //     };
  //   }
  //
  //   if (trade instanceof CelerCrossChainTrade) {
  //     const { fromTrade, toTrade } = trade;
  //     const fromProvider = fromTrade.provider.type;
  //     const toProvider = toTrade.provider.type;
  //
  //     const priceImpactFrom = PriceImpactService.calculatePriceImpact(
  //       fromTrade.fromToken.price.toNumber(),
  //       fromTrade.toToken.price.toNumber(),
  //       fromTrade.fromToken.tokenAmount,
  //       fromTrade.toToken.tokenAmount
  //     );
  //
  //     const priceImpactTo = PriceImpactService.calculatePriceImpact(
  //       toTrade.fromToken.price.toNumber(),
  //       toTrade.toToken.price.toNumber(),
  //       toTrade.fromToken.tokenAmount,
  //       toTrade.toToken.tokenAmount
  //     );
  //
  //     return {
  //       feePercent: trade.feeInfo.platformFee.percent,
  //       feeAmount: new BigNumber(1),
  //       feeTokenSymbol: 'USDC',
  //       cryptoFee: new BigNumber(trade.feeInfo?.cryptoFee?.amount).toNumber(),
  //       estimatedGas,
  //       priceImpactFrom: Number.isNaN(priceImpactFrom) ? 0 : priceImpactFrom,
  //       priceImpactTo: Number.isNaN(priceImpactTo) ? 0 : priceImpactTo,
  //       fromProvider,
  //       toProvider
  //     };
  //   }
  //
  //   throw new RubicError('[RUBIC SDK] Unknown trade provider.');
  // }

  public calculateSmartRouting(wrappedTrade: WrappedCrossChainTrade): SmartRouting | null {
    if (!wrappedTrade?.trade) {
      return null;
    }

    let smartRouting: SmartRouting = {
      fromProvider: wrappedTrade.trade.itType.from,
      toProvider: wrappedTrade.trade.itType.to,
      bridgeProvider: wrappedTrade.tradeType
    };

    if (this.queryParamsService.enabledProviders) {
      return smartRouting;
    }

    if (
      wrappedTrade.trade instanceof LifiCrossChainTrade ||
      wrappedTrade.trade instanceof ViaCrossChainTrade ||
      wrappedTrade.trade instanceof RangoCrossChainTrade
    ) {
      return {
        ...smartRouting,
        bridgeProvider: wrappedTrade.trade.bridgeType
      };
    }
    return smartRouting;
  }

  public async approve(wrappedTrade: WrappedCrossChainTrade): Promise<void> {
    const fromBlockchain = wrappedTrade?.trade?.from?.blockchain as BlockchainName;
    const toBlockchain = wrappedTrade?.trade?.to?.blockchain as BlockchainName;

    if (
      fromBlockchain &&
      !this.platformConfigurationService.isAvailableBlockchain(fromBlockchain)
    ) {
      throw new BlockchainIsUnavailableWarning(blockchainLabel[fromBlockchain]);
    }

    if (toBlockchain && !this.platformConfigurationService.isAvailableBlockchain(toBlockchain)) {
      throw new BlockchainIsUnavailableWarning(blockchainLabel[toBlockchain]);
    }

    this.checkDeviceAndShowNotification();
    let approveInProgressSubscription$: Subscription;

    const shouldCalculateGasPrice = shouldCalculateGas[fromBlockchain];
    const swapOptions = {
      onTransactionHash: () => {
        approveInProgressSubscription$ = this.notificationsService.showApproveInProgress();
      },
      ...(Boolean(shouldCalculateGasPrice) && {
        gasPrice: Web3Pure.toWei(await this.gasService.getGasPriceInEthUnits(fromBlockchain))
      })
    };

    try {
      await wrappedTrade.trade.approve(swapOptions);
      this.notificationsService.showApproveSuccessful();
    } catch (err) {
      throw err;
    } finally {
      approveInProgressSubscription$?.unsubscribe();
    }
  }

  public parseCalculationError(error: RubicSdkError): RubicError<ERROR_TYPE> {
    if (error instanceof NotSupportedTokensError) {
      return new RubicError('Currently, Rubic does not support swaps between these tokens.');
    }
    if (error instanceof UnsupportedReceiverAddressError) {
      return new RubicError('This provider doesn’t support the receiver address.');
    }
    if (error instanceof CrossChainIsUnavailableError) {
      return new CrossChainIsUnavailableWarning();
    }
    if (error?.message?.includes('Representation of ')) {
      return new RubicError('The swap between this pair of blockchains is currently unavailable.');
    }
    if (error?.message?.includes('No available routes')) {
      return new RubicError('No available routes.');
    }
    if (error?.message?.includes('There are no providers for trade')) {
      return new RubicError('There are no providers for trade.');
    }
    if (error instanceof LowSlippageError) {
      return new RubicError('Slippage is too low for transaction.');
    }
    if (error instanceof TooLowAmountError) {
      return new RubicError(
        "The swap can't be executed with the entered amount of tokens. Please change it to the greater amount."
      );
    }
    if (error instanceof MinAmountError || error instanceof MaxAmountError) {
      return new RubicError(error.message);
    }
    return new RubicError(
      'The swap between this pair of tokens is currently unavailable. Please try again later.'
    );
  }

  private checkDeviceAndShowNotification(): void {
    if (this.iframeService.isIframe && this.iframeService.device === 'mobile') {
      this.notificationsService.showOpenMobileWallet();
    }
  }

  private notifyGtmAfterSignTx(txHash: string): void {
    const { fromToken, toToken, fromAmount } = this.swapFormService.inputValue;

    // @TODO remove hardcode
    const fee = new BigNumber(1);

    this.gtmService.fireTxSignedEvent(
      SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING,
      txHash,
      fromToken.symbol,
      toToken.symbol,
      fee,
      fromAmount.multipliedBy(fromToken.price)
    );
  }

  public openSwapSchemeModal(
    providerTrade: CrossChainProviderTrade,
    txHash: string,
    timestamp: number
  ): void {
    const { fromBlockchain, toBlockchain, fromToken, toToken } = this.swapFormService.inputValue;

    const routing = providerTrade.smartRouting;

    const { trade } = providerTrade;

    let routingBridgeProvider;
    if (
      trade instanceof LifiCrossChainTrade ||
      trade instanceof ViaCrossChainTrade ||
      trade instanceof RangoCrossChainTrade
    ) {
      routingBridgeProvider = trade.bridgeType;
    } else {
      routingBridgeProvider = trade.type;
    }
    const bridgeProvider = TRADES_PROVIDERS[routingBridgeProvider];

    const fromTradeProvider = routing.fromProvider
      ? TRADES_PROVIDERS[routing.fromProvider]
      : {
          ...TRADES_PROVIDERS[routing.bridgeProvider],
          name: TRADES_PROVIDERS[routing.bridgeProvider].name + ' Pool'
        };
    const toTradeProvider = routing.toProvider
      ? TRADES_PROVIDERS[routing.toProvider]
      : {
          ...TRADES_PROVIDERS[routing.bridgeProvider],
          name: TRADES_PROVIDERS[routing.bridgeProvider].name + ' Pool'
        };

    const viaUuid =
      providerTrade.trade instanceof ViaCrossChainTrade ? providerTrade.trade.uuid : undefined;
    const rangoRequestId =
      providerTrade.trade instanceof RangoCrossChainTrade
        ? providerTrade.trade.requestId
        : undefined;

    const amountOutMin = providerTrade.trade.toTokenAmountMin.toFixed();

    this.dialogService
      .open<SwapSchemeModalData>(new PolymorpheusComponent(SwapSchemeModalComponent), {
        size: this.headerStore.isMobile ? 'page' : 'l',
        data: {
          fromToken,
          fromBlockchain,
          toToken,
          toBlockchain,
          srcProvider: fromTradeProvider,
          dstProvider: toTradeProvider,
          crossChainProvider: providerTrade.tradeType,
          srcTxHash: txHash,
          bridgeType: bridgeProvider,
          viaUuid,
          rangoRequestId,
          timestamp,
          amountOutMin
        }
      })
      .subscribe();
  }

  public saveNewProvider(
    blockchain: BlockchainName,
    tradeType: CrossChainTradeType,
    address: string
  ): void {
    this.crossChainRoutingApiService.saveNewProvider(blockchain, tradeType, address).subscribe();
  }
}
