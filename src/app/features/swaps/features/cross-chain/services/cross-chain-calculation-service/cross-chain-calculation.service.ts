import { TradeCalculationService } from '@features/swaps/core/services/trade-calculation-service/trade-calculation.service';
import {
  BlockchainName,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainManagerCalculationOptions,
  CrossChainProvider,
  CrossChainTradeType,
  LifiCrossChainTrade,
  NotWhitelistedProviderError,
  RangoCrossChainTrade,
  SwapTransactionOptions,
  UnnecessaryApproveError,
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
import { from, Observable, of, Subscription } from 'rxjs';
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
import { shouldCalculateGas } from '@shared/models/blockchain/should-calculate-gas';
import { GasService } from '@core/services/gas-service/gas.service';
import { AuthService } from '@core/services/auth/auth.service';
import { map, switchMap } from 'rxjs/operators';
import { TRADES_PROVIDERS } from '@features/swaps/shared/constants/trades-providers/trades-providers';
import {
  CrossChainCalculatedTrade,
  CrossChainCalculatedTradeData
} from '@features/swaps/features/cross-chain/models/cross-chain-calculated-trade';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { TargetNetworkAddressService } from '@features/swaps/shared/components/target-network-address/services/target-network-address.service';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import BlockchainIsUnavailableWarning from '@core/errors/models/common/blockchain-is-unavailable.warning';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { CrossChainApiService } from '@core/services/backend/cross-chain-routing-api/cross-chain-api.service';

@Injectable()
export class CrossChainCalculationService extends TradeCalculationService {
  private readonly defaultTimeout = 25_000;

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
    private readonly gasService: GasService,
    private readonly authService: AuthService,
    private readonly queryParamsService: QueryParamsService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly crossChainApiService: CrossChainApiService
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

  public calculateTrade(
    calculateNeedApprove: boolean,
    disabledTradeTypes: CrossChainTradeType[]
  ): Observable<CrossChainCalculatedTradeData> {
    const { fromToken, fromAmount, toToken } = this.swapFormService.inputValue;

    const slippageTolerance = this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
    const receiverAddress = this.receiverAddress;

    const { disabledCrossChainTradeTypes: apiDisabledTradeTypes, disabledBridgeTypes } =
      this.platformConfigurationService.disabledProviders;
    const iframeDisabledTradeTypes = this.queryParamsService.disabledProviders;
    // eslint-disable-next-line unused-imports/no-unused-vars
    const disabledProviders = Array.from(
      new Set<CrossChainTradeType>([
        ...disabledTradeTypes,
        ...(apiDisabledTradeTypes || []),
        ...(iframeDisabledTradeTypes || [])
      ])
    );

    const options: CrossChainManagerCalculationOptions = {
      fromSlippageTolerance: slippageTolerance / 2,
      toSlippageTolerance: slippageTolerance / 2,
      slippageTolerance,
      timeout: this.defaultTimeout,
      disabledProviders: [
        'bridgers',
        'cbridge',
        'debridge',
        'lifi',
        'multichain',
        'rango',
        'via',
        'symbiosis'
      ],
      lifiDisabledBridgeTypes: disabledBridgeTypes?.[CROSS_CHAIN_TRADE_TYPE.LIFI],
      rangoDisabledBridgeTypes: disabledBridgeTypes?.[CROSS_CHAIN_TRADE_TYPE.RANGO],
      ...(receiverAddress && { receiverAddress })
    };

    return this.sdk.crossChain
      .calculateTradesReactively(fromToken, fromAmount, toToken, options)
      .pipe(
        switchMap(reactivelyCalculatedTradeData => {
          const { total, calculated, wrappedTrade } = reactivelyCalculatedTradeData;

          if (wrappedTrade?.error instanceof NotWhitelistedProviderError) {
            this.saveNotWhitelistedProvider(
              fromToken.blockchain,
              wrappedTrade.tradeType,
              wrappedTrade.error.providerRouter,
              wrappedTrade.error.providerGateway
            );
          }

          const trade = wrappedTrade?.trade;
          return from(calculateNeedApprove && trade ? from(trade.needApprove()) : of(false)).pipe(
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

  /**
   * Parses cross-chain route of calculated trade.
   */
  public parseRoute(wrappedTrade: WrappedCrossChainTrade): CrossChainRoute | null {
    if (!wrappedTrade?.trade) {
      return null;
    }

    let smartRouting: CrossChainRoute = {
      fromProvider: wrappedTrade.trade.onChainSubtype.from,
      toProvider: wrappedTrade.trade.onChainSubtype.to,
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
    this.checkBlockchainsAvailable(wrappedTrade);
    this.checkDeviceAndShowNotification();

    const blockchain = wrappedTrade.trade.from.blockchain;
    const gasPrice = shouldCalculateGas[blockchain]
      ? Web3Pure.toWei(await this.gasService.getGasPriceInEthUnits(blockchain))
      : null;

    let approveInProgressSubscription$: Subscription;
    const swapOptions = {
      onTransactionHash: () => {
        approveInProgressSubscription$ = this.notificationsService.showApproveInProgress();
      },
      ...(gasPrice && { gasPrice })
    };

    try {
      await wrappedTrade.trade.approve(swapOptions);

      this.notificationsService.showApproveSuccessful();
    } catch (err) {
      if (err instanceof UnnecessaryApproveError) {
        return;
      }
      throw err;
    } finally {
      approveInProgressSubscription$?.unsubscribe();
    }
  }

  public async swapTrade(
    calculatedTrade: CrossChainCalculatedTrade,
    confirmCallback?: () => void
  ): Promise<void> {
    this.checkBlockchainsAvailable(calculatedTrade);
    this.checkDeviceAndShowNotification();

    const fromAddress = this.authService.userAddress;
    const onTransactionHash = (txHash: string) => {
      confirmCallback?.();

      const timestamp = Date.now();
      const viaUuid =
        calculatedTrade.trade instanceof ViaCrossChainTrade && calculatedTrade.trade.uuid;
      const rangoRequestId =
        calculatedTrade.trade instanceof RangoCrossChainTrade && calculatedTrade.trade.requestId;

      const tradeData: RecentTrade = {
        srcTxHash: txHash,
        fromToken: this.swapFormService.inputValue.fromToken,
        toToken: this.swapFormService.inputValue.toToken,
        crossChainTradeType: calculatedTrade.tradeType,
        timestamp,
        bridgeType: calculatedTrade.trade.bridgeType,
        amountOutMin: calculatedTrade.trade.toTokenAmountMin.toFixed(),

        ...(viaUuid && { viaUuid }),
        ...(rangoRequestId && { rangoRequestId })
      };

      this.openSwapSchemeModal(calculatedTrade, txHash, timestamp);
      this.recentTradesStoreService.saveTrade(fromAddress, tradeData);

      this.notifyGtmAfterSignTx(txHash);
    };

    const blockchain = calculatedTrade.trade.from.blockchain;
    const gasPrice = shouldCalculateGas[blockchain]
      ? Web3Pure.toWei(await this.gasService.getGasPriceInEthUnits(blockchain))
      : null;

    const receiverAddress = this.receiverAddress;
    const swapOptions: SwapTransactionOptions = {
      onConfirm: onTransactionHash,
      ...(receiverAddress && { receiverAddress }),
      ...(gasPrice && { gasPrice })
    };

    try {
      await calculatedTrade.trade.swap(swapOptions);
      this.showSuccessTrxNotification(calculatedTrade.tradeType);
    } catch (err) {
      if (err instanceof NotWhitelistedProviderError) {
        this.saveNotWhitelistedProvider(
          calculatedTrade.trade.from.blockchain,
          calculatedTrade.tradeType,
          err.providerRouter,
          err.providerGateway
        );
      }
      throw err;
    }
  }

  private checkBlockchainsAvailable(wrappedTrade: WrappedCrossChainTrade): void | never {
    const fromBlockchain = wrappedTrade.trade.from.blockchain;
    const toBlockchain = wrappedTrade.trade.to.blockchain;
    if (!this.platformConfigurationService.isAvailableBlockchain(fromBlockchain)) {
      throw new BlockchainIsUnavailableWarning(blockchainLabel[fromBlockchain]);
    }
    if (!this.platformConfigurationService.isAvailableBlockchain(toBlockchain)) {
      throw new BlockchainIsUnavailableWarning(blockchainLabel[toBlockchain]);
    }
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
    calculatedTrade: CrossChainCalculatedTrade,
    txHash: string,
    timestamp: number
  ): void {
    const { fromBlockchain, toBlockchain, fromToken, toToken } = this.swapFormService.inputValue;
    const { trade, route } = calculatedTrade;

    const bridgeType = trade.bridgeType;
    const bridgeProvider = TRADES_PROVIDERS[bridgeType];

    const fromTradeProvider = route.fromProvider
      ? TRADES_PROVIDERS[route.fromProvider]
      : {
          ...bridgeProvider,
          name: bridgeProvider.name + ' Pool'
        };
    const toTradeProvider = route.toProvider
      ? TRADES_PROVIDERS[route.toProvider]
      : {
          ...bridgeProvider,
          name: bridgeProvider.name + ' Pool'
        };

    const viaUuid =
      calculatedTrade.trade instanceof ViaCrossChainTrade ? calculatedTrade.trade.uuid : undefined;
    const rangoRequestId =
      calculatedTrade.trade instanceof RangoCrossChainTrade
        ? calculatedTrade.trade.requestId
        : undefined;

    const amountOutMin = calculatedTrade.trade.toTokenAmountMin.toFixed();

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
          crossChainProvider: calculatedTrade.tradeType,
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

  private saveNotWhitelistedProvider(
    blockchain: BlockchainName,
    tradeType: CrossChainTradeType,
    routerAddress: string,
    gatewayAddress?: string
  ): void {
    this.crossChainApiService
      .saveNotWhitelistedProvider(blockchain, tradeType, routerAddress, gatewayAddress)
      .subscribe();
  }
}
