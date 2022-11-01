import { TradeCalculationService } from '@features/swaps/core/services/trade-calculation-service/trade-calculation.service';
import {
  BlockchainName,
  compareAddresses,
  CrossChainIsUnavailableError,
  CrossChainManagerCalculationOptions,
  CrossChainProvider,
  CrossChainTrade,
  CrossChainTradeType,
  LifiCrossChainTrade,
  LowSlippageError,
  MaxAmountError,
  MinAmountError,
  RangoCrossChainTrade,
  RubicSdkError,
  SwapTransactionOptions,
  TooLowAmountError,
  UnsupportedReceiverAddressError,
  ViaCrossChainTrade,
  Web3Pure,
  WrappedCrossChainTrade
} from 'rubic-sdk';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { Inject, Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { CrossChainRoute } from '@features/swaps/features/cross-chain/models/cross-chain-route';
import CrossChainIsUnavailableWarning from '@core/errors/models/cross-chain-routing/cross-chainIs-unavailable-warning';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { BehaviorSubject, from, Observable, of, Subscription } from 'rxjs';
import { IframeService } from '@core/services/iframe/iframe.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swaps-form/models/swap-provider-type';
import { RecentTrade } from '@app/shared/models/my-trades/recent-trades.interface';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { TuiDialogService } from '@taiga-ui/core';
import { SwapSchemeModalComponent } from '../../components/swap-scheme-modal/swap-scheme-modal.component';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { HeaderStore } from '@app/core/header/services/header.store';
import { SwapSchemeModalData } from '../../models/swap-scheme-modal-data.interface';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { CrossChainRoutingApiService } from '@core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import { shouldCalculateGas } from '@shared/models/blockchain/should-calculate-gas';
import { GasService } from '@core/services/gas-service/gas.service';
import { RubicError } from '@core/errors/models/rubic-error';
import { AuthService } from '@core/services/auth/auth.service';
import { Token } from '@shared/models/tokens/token';
import { map, switchMap } from 'rxjs/operators';
import { TRADES_PROVIDERS } from '@shared/constants/common/trades-providers';
import {
  CrossChainCalculatedTrade,
  CrossChainCalculatedTradeData
} from '@features/swaps/features/cross-chain/models/cross-chain-calculated-trade';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { TargetNetworkAddressService } from '@features/swaps/shared/target-network-address/services/target-network-address.service';

export type AllProviders = {
  readonly totalAmount: number;
  readonly data: ReadonlyArray<WrappedCrossChainTrade & { rank: number }>;
};

@Injectable({
  providedIn: 'root'
})
export class CrossChainCalculationService extends TradeCalculationService {
  private readonly _selectedProvider$ = new BehaviorSubject<CrossChainTradeType | null>(null);

  public setSelectedProvider(type: CrossChainTradeType): void {
    this._selectedProvider$.next(type);
  }

  public readonly selectedProvider$ = this._selectedProvider$.asObservable();

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

  constructor(
    private readonly sdk: RubicSdkService,
    private readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly iframeService: IframeService,
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly headerStore: HeaderStore,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly apiService: CrossChainRoutingApiService,
    private readonly gasService: GasService,
    private readonly authService: AuthService,
    private readonly queryParamsService: QueryParamsService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService
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

  public calculateTrade(isUserAuthorized: boolean): Observable<CrossChainCalculatedTradeData> {
    const { fromToken, fromAmount, toToken } = this.swapFormService.inputValue;

    const slippageTolerance = this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
    const receiverAddress = this.receiverAddress;
    const disabledProvidersForLandingIframe = this.queryParamsService.disabledProviders;
    const options: CrossChainManagerCalculationOptions = {
      fromSlippageTolerance: slippageTolerance / 2,
      toSlippageTolerance: slippageTolerance / 2,
      slippageTolerance,
      timeout: this.defaultTimeout,
      disabledProviders: disabledProvidersForLandingIframe || [],
      ...(receiverAddress && { receiverAddress })
    };

    return this.sdk.crossChain
      .calculateTradesReactively(fromToken, fromAmount, toToken, options)
      .pipe(
        switchMap(reactivelyCalculatedTradeData => {
          const { total, calculated, wrappedTrade } = reactivelyCalculatedTradeData;
          const trade = wrappedTrade?.trade;

          return from(isUserAuthorized && trade ? from(trade.needApprove()) : of(false)).pipe(
            map((needApprove): CrossChainCalculatedTradeData => {
              return {
                total: total,
                calculated: calculated,
                lastCalculatedTrade: wrappedTrade
                  ? {
                      ...wrappedTrade,
                      needApprove,
                      route: this.parseRoute(wrappedTrade)
                    }
                  : null
              };
            })
          );
        })
      );
  }

  public async createTrade(
    providerTrade: CrossChainCalculatedTrade,
    confirmCallback?: () => void
  ): Promise<void> {
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

      if (providerTrade.route) {
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

  public parseRoute(wrappedTrade: WrappedCrossChainTrade): CrossChainRoute | null {
    if (!wrappedTrade?.trade) {
      return null;
    }

    let smartRouting: CrossChainRoute = {
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
    this.checkDeviceAndShowNotification();
    let approveInProgressSubscription$: Subscription;

    const blockchain = wrappedTrade?.trade?.from?.blockchain as BlockchainName;
    const shouldCalculateGasPrice = shouldCalculateGas[blockchain];
    const swapOptions = {
      onTransactionHash: () => {
        approveInProgressSubscription$ = this.notificationsService.showApproveInProgress();
      },
      ...(Boolean(shouldCalculateGasPrice) && {
        gasPrice: Web3Pure.toWei(await this.gasService.getGasPriceInEthUnits(blockchain))
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

  // @todo add error types
  public parseCalculationError(error: RubicSdkError): RubicError<ERROR_TYPE> {
    if (error instanceof UnsupportedReceiverAddressError) {
      return new RubicError('This provider doesn’t support the receiver address.');
    }
    if (error instanceof CrossChainIsUnavailableError) {
      return new CrossChainIsUnavailableWarning();
    }
    if (error?.message?.includes('Representation of ')) {
      return new RubicError('The swap between this pair of blockchains is currently unavailable.');
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
    providerTrade: CrossChainCalculatedTrade,
    txHash: string,
    timestamp: number
  ): void {
    const { fromBlockchain, toBlockchain, fromToken, toToken } = this.swapFormService.inputValue;

    const routing = providerTrade.route;

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
}
