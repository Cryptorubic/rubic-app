import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { forkJoin, Observable } from 'rxjs';

import { SdkService } from '@core/services/sdk/sdk.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TradeContainer } from '@features/trade/models/trade-container';
import {
  BlockchainName,
  ChangenowCrossChainTrade,
  ChangenowPaymentInfo,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainManagerCalculationOptions,
  CrossChainTradeType,
  LifiCrossChainTrade,
  NotWhitelistedProviderError,
  PriceToken,
  Token,
  UnapprovedContractError,
  WrappedCrossChainTrade
} from 'rubic-sdk';
import { TargetNetworkAddressService } from '@features/swaps/core/services/target-network-address-service/target-network-address.service';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import BigNumber from 'bignumber.js';
import { CrossChainRoute } from '@features/swaps/features/cross-chain/models/cross-chain-route';
import { CrossChainApiService } from '@features/trade/services/cross-chain-routing-api/cross-chain-api.service';
// import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';

import { CrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';

@Injectable()
export class CrossChainService {
  private readonly defaultTimeout = 25_000;

  private get receiverAddress(): string | null {
    // if (!this.settingsService.crossChainRoutingValue.showReceiverAddress) {
    //   return null;
    // }
    return this.targetNetworkAddressService.address;
  }

  constructor(
    private readonly sdkService: SdkService,
    private readonly swapFormService: SwapsFormService,
    // private readonly settingsService: SettingsService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly queryParamsService: QueryParamsService,
    private readonly tokensService: TokensService,
    private readonly crossChainApiService: CrossChainApiService
  ) {}

  public calculateTrades(disabledTradeTypes: CrossChainTradeType[]): Observable<TradeContainer> {
    const { fromToken, toToken, fromAmount } = this.swapFormService.inputValue;
    return forkJoin([
      this.sdkService.deflationTokenManager.isDeflationToken(new Token(fromToken)),
      this.tokensService.getAndUpdateTokenPrice(fromToken, true),
      this.tokensService.getAndUpdateTokenPrice(toToken, true)
    ]).pipe(
      switchMap(([tokenState, fromPrice, toPrice]) => {
        const fromSdkCompatibleToken = new PriceToken({
          ...fromToken,
          price: new BigNumber(fromPrice as number | null)
        });
        const toSdkCompatibleToken = new PriceToken({
          ...toToken,
          price: new BigNumber(toPrice as number | null)
        });
        const options = this.getOptions(disabledTradeTypes);

        // const calculationStartTime = Date.now();

        return this.sdkService.crossChain
          .calculateTradesReactively(
            fromSdkCompatibleToken,
            fromAmount.toFixed(),
            toSdkCompatibleToken,
            tokenState.isDeflation
              ? { ...options, useProxy: this.getDisabledProxyConfig() }
              : options
          )
          .pipe(map(el => ({ value: el, type: SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING })));
      })
    );
  }

  private getOptions(
    _disabledTradeTypes: CrossChainTradeType[]
  ): CrossChainManagerCalculationOptions {
    // const slippageTolerance = this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
    const receiverAddress = this.receiverAddress;

    const { /* disabledCrossChainTradeTypes: apiDisabledTradeTypes, */ disabledBridgeTypes } =
      this.platformConfigurationService.disabledProviders;
    const queryLifiDisabledBridges = this.queryParamsService.disabledLifiBridges;

    // const iframeDisabledTradeTypes = this.queryParamsService.disabledProviders;
    // const disabledProviders = Array.from(
    //   new Set<CrossChainTradeType>([
    //     ...disabledTradeTypes,
    //     ...(apiDisabledTradeTypes || []),
    //     ...(iframeDisabledTradeTypes || [])
    //   ])
    // );

    return {
      // fromSlippageTolerance: slippageTolerance / 2,
      // toSlippageTolerance: slippageTolerance / 2,
      // slippageTolerance,
      fromSlippageTolerance: 1,
      toSlippageTolerance: 1,
      slippageTolerance: 1,
      timeout: this.defaultTimeout,
      disabledProviders: [], //disabledProviders,
      lifiDisabledBridgeTypes: [
        ...(disabledBridgeTypes?.[CROSS_CHAIN_TRADE_TYPE.LIFI] || []),
        ...(queryLifiDisabledBridges || [])
      ],
      ...(receiverAddress && { receiverAddress }),
      changenowFullyEnabled: true,
      useProxy: this.platformConfigurationService.useCrossChainChainProxy
    };
  }

  private getDisabledProxyConfig(): Record<CrossChainTradeType, boolean> {
    return Object.fromEntries(
      Object.values(CROSS_CHAIN_TRADE_TYPE).map(tradeType => [tradeType, false])
    ) as Record<CrossChainTradeType, boolean>;
  }

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

    if (wrappedTrade.trade instanceof LifiCrossChainTrade && wrappedTrade.trade.bridgeType) {
      return {
        ...smartRouting,
        bridgeProvider: wrappedTrade.trade.bridgeType
      };
    }
    return smartRouting;
  }

  private saveNotWhitelistedProvider(
    error: NotWhitelistedProviderError | UnapprovedContractError,
    blockchain: BlockchainName,
    tradeType: CrossChainTradeType
  ): void {
    if (error instanceof NotWhitelistedProviderError) {
      this.crossChainApiService
        .saveNotWhitelistedProvider(error, blockchain, tradeType)
        .subscribe();
    } else {
      this.crossChainApiService
        .saveNotWhitelistedCcrProvider(error, blockchain, tradeType)
        .subscribe();
    }
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

  public async swapTrade(trade: CrossChainTrade): Promise<void> {
    // if (this.isSwapStarted === SWAP_PROCESS.NONE) {
    //   this.isSwapStarted = SWAP_PROCESS.SWAP_STARTED;
    // }

    // if (
    //   this.selectedTrade.trade.type === CROSS_CHAIN_TRADE_TYPE.CHANGENOW &&
    //   !BlockchainsInfo.isEvmBlockchainName(this.selectedTrade.trade.from.blockchain)
    // ) {
    //   await this.handleChangenowNonEvmTrade();
    //   return;
    // }

    // if (!this.isSlippageCorrect()) {
    //   return;
    // }
    // if (
    //   !(await this.settingsService.checkSlippageAndPriceImpact(
    //     SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING,
    //     this.selectedTrade.trade
    //   ))
    // ) {
    //   return;
    // }

    // this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
    // this.refreshService.startInProgress();

    try {
      // await this.crossChainCalculationService.swapTrade(currentSelectedTrade, () => {
      //   this.isSwapStarted = SWAP_PROCESS.NONE;
      //   this.unsetTradeSelectedByUser();
      //
      //   if (this.updatedSelectedTrade) {
      //     this.updateSelectedTrade(this.updatedSelectedTrade);
      //   }
      //
      //   this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
      //   this.refreshService.stopInProgress();
      //
      //   this.startRecalculation();
      // });

      // const fromToken = currentSelectedTrade.trade.from;
      // await this.tokensService.updateTokenBalanceAfterCcrSwap(fromToken);
      await trade.swap();
    } catch (error) {
      // this.handleSwapError(error, currentSelectedTrade.tradeType);
      // const parsedError = RubicSdkErrorParser.parseError(error);
      //
      // if (!(parsedError instanceof UserRejectError)) {
      //   this.gtmService.fireTransactionError(GA_ERRORS_CATEGORY.CROSS_CHAIN_SWAP, error.message);
      // }
    }
  }
}
