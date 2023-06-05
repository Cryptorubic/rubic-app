import { TradeCalculationService } from '@features/swaps/core/services/trade-service/trade-calculation.service';
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
  WrappedCrossChainTrade,
  ChangenowCrossChainTrade,
  ChangenowPaymentInfo,
  Token,
  PriceToken,
  BLOCKCHAIN_NAME,
  UserRejectError
} from 'rubic-sdk';
import { SdkService } from '@core/services/sdk/sdk.service';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { CrossChainRoute } from '@features/swaps/features/cross-chain/models/cross-chain-route';
import { firstValueFrom, forkJoin, Observable, of, Subscription } from 'rxjs';
import { IframeService } from '@core/services/iframe/iframe.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { CrossChainRecentTrade } from '@shared/models/recent-trades/cross-chain-recent-trade';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { SwapSchemeModalComponent } from '../../components/swap-scheme-modal/swap-scheme-modal.component';
import { HeaderStore } from '@app/core/header/services/header.store';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { GasService } from '@core/services/gas-service/gas.service';
import { AuthService } from '@core/services/auth/auth.service';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { TRADES_PROVIDERS } from '@features/swaps/shared/constants/trades-providers/trades-providers';
import {
  CrossChainCalculatedTrade,
  CrossChainCalculatedTradeData
} from '@features/swaps/features/cross-chain/models/cross-chain-calculated-trade';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { TargetNetworkAddressService } from '@features/swaps/core/services/target-network-address-service/target-network-address.service';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import BlockchainIsUnavailableWarning from '@core/errors/models/common/blockchain-is-unavailable.warning';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { CrossChainApiService } from '@core/services/backend/cross-chain-routing-api/cross-chain-api.service';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { TokensService } from '@core/services/tokens/tokens.service';
import { BasicTransactionOptions } from 'rubic-sdk/lib/core/blockchain/web3-private-service/web3-private/models/basic-transaction-options';
import { centralizedBridges } from '@features/swaps/shared/constants/trades-providers/centralized-bridges';
import { ModalService } from '@app/core/modals/services/modal.service';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';

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
    private readonly sdkService: SdkService,
    private readonly settingsService: SettingsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly iframeService: IframeService,
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly headerStore: HeaderStore,
    private readonly dialogService: ModalService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly gasService: GasService,
    private readonly authService: AuthService,
    private readonly queryParamsService: QueryParamsService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly crossChainApiService: CrossChainApiService,
    private readonly tokensService: TokensService,
    private readonly swapAndEarnStateService: SwapAndEarnStateService
  ) {
    super('cross-chain-routing');
  }

  private isSwapAndEarnSwap(calculatedTrade: CrossChainCalculatedTrade): boolean {
    if (
      calculatedTrade.tradeType === CROSS_CHAIN_TRADE_TYPE.CHANGENOW ||
      calculatedTrade.trade.from.blockchain === BLOCKCHAIN_NAME.ZK_SYNC
    ) {
      return false;
    }

    return !!calculatedTrade.trade.feeInfo?.rubicProxy?.fixedFee?.amount.gt(0);
  }

  public isSupportedBlockchain(blockchain: BlockchainName): boolean {
    return Object.values(this.sdkService.crossChain.tradeProviders).some(
      (provider: CrossChainProvider) => provider.isSupportedBlockchain(blockchain)
    );
  }

  public areSupportedBlockchains(
    fromBlockchain: BlockchainName,
    toBlockchain: BlockchainName
  ): boolean {
    return Object.values(this.sdkService.crossChain.tradeProviders).some(
      (provider: CrossChainProvider) =>
        provider.areSupportedBlockchains(fromBlockchain, toBlockchain)
    );
  }

  public calculateTrade(
    calculateNeedApprove: boolean,
    disabledTradeTypes: CrossChainTradeType[],
    fromToken: TokenAmount,
    toToken: TokenAmount,
    fromAmount: BigNumber
  ): Observable<CrossChainCalculatedTradeData> {
    const slippageTolerance = this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
    const receiverAddress = this.receiverAddress;

    const { disabledCrossChainTradeTypes: apiDisabledTradeTypes, disabledBridgeTypes } =
      this.platformConfigurationService.disabledProviders;
    const queryLifiDisabledBridges = this.queryParamsService.disabledLifiBridges;

    const iframeDisabledTradeTypes = this.queryParamsService.disabledProviders;
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
      // @TODO CCR
      disabledProviders: disabledProviders,
      lifiDisabledBridgeTypes: [
        ...(disabledBridgeTypes?.[CROSS_CHAIN_TRADE_TYPE.LIFI] || []),
        ...(queryLifiDisabledBridges || [])
      ],
      rangoDisabledBridgeTypes: disabledBridgeTypes?.[CROSS_CHAIN_TRADE_TYPE.RANGO],
      ...(receiverAddress && { receiverAddress }),
      changenowFullyEnabled: true,
      useProxy: this.platformConfigurationService.useCrossChainChainProxy
    };

    return forkJoin([
      this.sdkService.deflationTokenManager.isDeflationToken(new Token(fromToken)),
      this.tokensService.getAndUpdateTokenPrice(fromToken, true),
      this.tokensService.getAndUpdateTokenPrice(toToken, true)
    ]).pipe(
      switchMap(([tokenState, fromPrice, toPrice]) => {
        const disableProxyConfig = Object.fromEntries(
          Object.values(CROSS_CHAIN_TRADE_TYPE).map(tradeType => [tradeType, false])
        ) as Record<CrossChainTradeType, boolean>;
        const fromSdkCompatibleToken = new PriceToken({
          ...new Token(fromToken),
          price: new BigNumber(fromPrice)
        });
        const toSdkCompatibleToken = new PriceToken({
          ...new Token(toToken),
          price: new BigNumber(toPrice)
        });
        return this.sdkService.crossChain
          .calculateTradesReactively(
            fromSdkCompatibleToken,
            fromAmount,
            toSdkCompatibleToken,
            tokenState.isDeflation ? { ...options, useProxy: disableProxyConfig } : options
          )
          .pipe(
            mergeMap(data => {
              const approve$ =
                calculateNeedApprove && data?.wrappedTrade?.trade
                  ? data.wrappedTrade.trade.needApprove()
                  : of(false);
              return forkJoin([of(data), approve$]);
            }),
            map(([reactivelyCalculatedTradeData, needApprove]) => {
              const { total, calculated, wrappedTrade } = reactivelyCalculatedTradeData;

              if (wrappedTrade?.error instanceof NotWhitelistedProviderError) {
                this.saveNotWhitelistedProvider(
                  wrappedTrade.error,
                  fromToken.blockchain,
                  wrappedTrade.tradeType
                );
              }

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
      (wrappedTrade.trade instanceof LifiCrossChainTrade ||
        wrappedTrade.trade instanceof ViaCrossChainTrade ||
        wrappedTrade.trade instanceof RangoCrossChainTrade) &&
      wrappedTrade.trade.bridgeType
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

    const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
      blockchain
    );

    let approveInProgressSubscription$: Subscription;
    const swapOptions: BasicTransactionOptions = {
      onTransactionHash: () => {
        approveInProgressSubscription$ = this.notificationsService.showApproveInProgress();
      },
      ...(shouldCalculateGasPrice && { gasPriceOptions })
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
    const isSwapAndEarnSwapTrade = this.isSwapAndEarnSwap(calculatedTrade);
    this.checkBlockchainsAvailable(calculatedTrade);
    this.checkDeviceAndShowNotification();

    const [fromToken, toToken] = await Promise.all([
      this.tokensService.findToken(calculatedTrade.trade.from),
      this.tokensService.findToken(calculatedTrade.trade.to)
    ]);

    const fromAddress = this.authService.userAddress;

    await this.handlePreSwapModal(calculatedTrade);

    let transactionHash: string;

    const onTransactionHash = (txHash: string) => {
      transactionHash = txHash;
      confirmCallback?.();
      this.crossChainApiService.createTrade(txHash, calculatedTrade.trade, isSwapAndEarnSwapTrade);

      const timestamp = Date.now();
      const viaUuid =
        calculatedTrade.trade instanceof ViaCrossChainTrade && calculatedTrade.trade.uuid;
      const rangoRequestId =
        calculatedTrade.trade instanceof RangoCrossChainTrade && calculatedTrade.trade.requestId;
      const changenowId =
        calculatedTrade.trade instanceof ChangenowCrossChainTrade && calculatedTrade.trade.id;

      const tradeData: CrossChainRecentTrade = {
        srcTxHash: txHash,
        fromToken,
        toToken,
        crossChainTradeType: calculatedTrade.tradeType,
        timestamp,
        bridgeType: calculatedTrade.trade.bridgeType,
        amountOutMin: calculatedTrade.trade.toTokenAmountMin.toFixed(),
        fromAmount: calculatedTrade.trade.from.stringWeiAmount,
        toAmount: calculatedTrade.trade.to.stringWeiAmount,

        ...(viaUuid && { viaUuid }),
        ...(rangoRequestId && { rangoRequestId }),
        ...(changenowId && { changenowId })
      };

      this.openSwapSchemeModal(calculatedTrade, txHash, timestamp, fromToken, toToken);
      try {
        this.recentTradesStoreService.saveTrade(fromAddress, tradeData);
      } catch {}

      this.notifyGtmAfterSignTx(txHash, fromToken, toToken, calculatedTrade.trade.from.tokenAmount);
    };

    const blockchain = calculatedTrade.trade.from.blockchain;

    const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
      blockchain
    );

    const receiverAddress = this.receiverAddress;
    const swapOptions: SwapTransactionOptions = {
      onConfirm: onTransactionHash,
      ...(receiverAddress && { receiverAddress }),
      ...(shouldCalculateGasPrice && { gasPriceOptions }),
      ...(this.queryParamsService.testMode && { testMode: true }),
      ...(this.platformConfigurationService.useCrossChainChainProxy && {
        useProxy:
          this.platformConfigurationService.useCrossChainChainProxy[calculatedTrade.tradeType]
      })
    };

    try {
      await calculatedTrade.trade.swap(swapOptions);
      this.showSuccessTrxNotification();
      await this.crossChainApiService.patchTrade(transactionHash, true);
    } catch (err) {
      if (
        transactionHash &&
        err instanceof Error &&
        err.message.includes('Transaction was not mined')
      ) {
        await this.crossChainApiService.patchTrade(transactionHash, false);
      }

      if (err instanceof NotWhitelistedProviderError) {
        this.saveNotWhitelistedProvider(
          err,
          calculatedTrade.trade.from.blockchain,
          calculatedTrade.tradeType
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

  private notifyGtmAfterSignTx(
    txHash: string,
    fromToken: TokenAmount,
    toToken: TokenAmount,
    fromAmount: BigNumber
  ): void {
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
    timestamp: number,
    fromToken: TokenAmount,
    toToken: TokenAmount
  ): void {
    const { trade, route } = calculatedTrade;

    const bridgeType = trade.bridgeType;
    let bridgeProvider = TRADES_PROVIDERS[bridgeType];

    const fromTradeProvider = route.fromProvider
      ? TRADES_PROVIDERS[route.fromProvider]
      : {
          ...bridgeProvider,
          name: bridgeProvider.name
        };
    const toTradeProvider = route.toProvider
      ? TRADES_PROVIDERS[route.toProvider]
      : {
          ...bridgeProvider,
          name: bridgeProvider.name
        };
    if (centralizedBridges.some(centralizedBridge => centralizedBridge === bridgeType)) {
      bridgeProvider = {
        ...bridgeProvider,
        name: bridgeProvider.name + ' (Centralized)'
      };
    }

    const viaUuid =
      calculatedTrade.trade instanceof ViaCrossChainTrade ? calculatedTrade.trade.uuid : undefined;
    const rangoRequestId =
      calculatedTrade.trade instanceof RangoCrossChainTrade
        ? calculatedTrade.trade.requestId
        : undefined;
    const amountOutMin = calculatedTrade.trade.toTokenAmountMin.toFixed();
    const changenowId =
      calculatedTrade.trade instanceof ChangenowCrossChainTrade
        ? calculatedTrade.trade.id
        : undefined;

    const defaultData = {
      fromToken,
      toToken,
      srcProvider: fromTradeProvider,
      dstProvider: toTradeProvider,
      crossChainProvider: calculatedTrade.tradeType,
      srcTxHash: txHash,
      bridgeType: bridgeProvider,
      viaUuid,
      rangoRequestId,
      timestamp,
      amountOutMin,
      changenowId
    };

    const swapAndEarnData = {
      ...defaultData,
      isSwapAndEarnData: true
    };

    this.dialogService
      .showDialog(SwapSchemeModalComponent, {
        size: this.headerStore.isMobile ? 'page' : 'l',
        data: this.isSwapAndEarnSwap(calculatedTrade) ? swapAndEarnData : defaultData,
        fitContent: true
      })
      .subscribe();
  }

  private saveNotWhitelistedProvider(
    error: NotWhitelistedProviderError,
    blockchain: BlockchainName,
    tradeType: CrossChainTradeType
  ): void {
    this.crossChainApiService.saveNotWhitelistedProvider(error, blockchain, tradeType).subscribe();
  }

  public async getChangenowPaymentInfo(
    trade: ChangenowCrossChainTrade
  ): Promise<{ paymentInfo: ChangenowPaymentInfo; receiverAddress: string }> {
    const receiverAddress = this.receiverAddress;
    const paymentInfo = await trade.getChangenowPostTrade(receiverAddress);
    return {
      paymentInfo,
      receiverAddress
    };
  }

  private async handlePreSwapModal(trade: CrossChainCalculatedTrade): Promise<void> {
    if (
      trade.tradeType === CROSS_CHAIN_TRADE_TYPE.ARBITRUM &&
      trade.trade.from.blockchain === BLOCKCHAIN_NAME.ARBITRUM
    ) {
      try {
        await firstValueFrom(this.dialogService.openArbitrumWarningModal());
      } catch {
        throw new UserRejectError();
      }
    }
  }
}
