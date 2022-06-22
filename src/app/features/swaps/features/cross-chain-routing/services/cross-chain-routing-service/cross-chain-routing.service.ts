import { Injectable } from '@angular/core';
import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';
import {
  BlockchainName,
  CelerRubicCrossChainTrade,
  compareAddresses,
  CROSS_CHAIN_TRADE_TYPE,
  PriceTokenAmount,
  Token
} from 'rubic-sdk';
import { RubicCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-trade-provider';
import { CelerCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-trade-provider';
import { SymbiosisCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade-provider';
import { WrappedCrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import { SwapManagerCrossChainCalculationOptions } from 'rubic-sdk/lib/features/cross-chain/models/swap-manager-cross-chain-options';
import { RubicError } from '@core/errors/models/rubic-error';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import {
  CelerRubicTradeInfo,
  SymbiosisTradeInfo
} from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade-info';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';
import BigNumber from 'bignumber.js';
import { TokensService } from '@core/services/tokens/tokens.service';
import { SymbiosisCrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade';
import { SmartRouting } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/smart-routing.interface';

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingService extends TradeService {
  public crossChainTrade: WrappedCrossChainTrade;

  public smartRouting: SmartRouting;

  public static isSupportedBlockchain(blockchainName: BlockchainName): boolean {
    return (
      RubicCrossChainTradeProvider.isSupportedBlockchain(blockchainName) ||
      CelerCrossChainTradeProvider.isSupportedBlockchain(blockchainName) ||
      SymbiosisCrossChainTradeProvider.isSupportedBlockchain(blockchainName)
    );
  }

  constructor(
    private readonly sdk: RubicSdkService,
    private readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly tokensService: TokensService
  ) {
    super('cross-chain-routing');
  }

  public async calculateTrade(_needApprove?: boolean): Promise<WrappedCrossChainTrade> {
    const { fromToken, fromAmount, toToken } = this.swapFormService.inputValue;
    const slippageTolerance = this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
    // @TODO SDK.
    const options: SwapManagerCrossChainCalculationOptions = {
      fromSlippageTolerance: slippageTolerance / 2,
      toSlippageTolerance: slippageTolerance / 2,
      slippageTolerance
    } as unknown;

    this.crossChainTrade = await this.sdk.crossChain.calculateTrade(
      fromToken,
      fromAmount.toString(),
      toToken,
      options
    );
    await this.calculateSmartRouting();
    return this.crossChainTrade;
  }

  public async createTrade(confirmCallback?: () => void): Promise<void> {
    await this.walletConnectorService.checkSettings(this.crossChainTrade.trade?.from?.blockchain);
    if (!this.crossChainTrade?.trade) {
      throw new RubicError('[RUBIC SDK] Cross chain trade object not found.');
    }
    await this.crossChainTrade.trade.swap({
      onConfirm: confirmCallback
    });
  }

  /**
   * Gets trade info to show in transaction info panel.
   */
  public async getTradeInfo(): Promise<CelerRubicTradeInfo | SymbiosisTradeInfo> {
    if (!this.crossChainTrade?.trade) {
      return null;
    }

    const trade = this.crossChainTrade.trade;
    const { estimatedGas } = trade;

    if (
      trade instanceof SymbiosisCrossChainTrade &&
      trade.type === CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS
    ) {
      return {
        estimatedGas,
        fee: trade.fee,
        feeSymbol: trade.feeSymbol,
        priceImpact: trade.priceImpact
      };
    }

    if (trade instanceof CelerRubicCrossChainTrade) {
      const { fromTrade, toTrade } = trade as CelerRubicCrossChainTrade;
      const fromProvider = fromTrade.provider.type;
      const toProvider = toTrade.provider.type;

      // const feePercent = trade.transitTokenFee;
      // const fee = feePercent / 100;
      // const feeAmount = trade.toTransitTokenAmount.multipliedBy(fee).dividedBy(1 - fee);
      const feePercent = 0;
      // const fee = 0.02;
      const feeAmount = new BigNumber(NaN);

      // const firstTransitToken = (trade.const[(priceImpactFrom, priceImpactTo)] = await Promise.all([
      //   this.calculatePriceImpact(
      //     fromToken,
      //     firstTransitToken,
      //     fromAmount,
      //     fromTransitTokenAmount,
      //     'from'
      //   ),
      //   this.calculatePriceImpact(toToken, secondTransitToken, toAmount, toTransitTokenAmount, 'to')
      // ]));

      const fromPath: null = null;
      const toPath: null = null;

      // const fromPath = trade.fromTrade ? trade.fromTrade.path.map(token => token.symbol) : null;
      // const toPath = trade.toTrade ? trade.toTrade.path.map(token => token.symbol) : null;

      const priceImpactFrom = 1;
      const priceImpactTo = 1;

      return {
        feePercent,
        feeAmount,
        feeTokenSymbol: 'TEST' /* secondTransitToken.symbol */,
        cryptoFee: 0 /* trade.cryptoFee.toNumber() */,
        estimatedGas,
        priceImpactFrom,
        priceImpactTo,
        fromProvider,
        toProvider,
        fromPath,
        toPath,
        usingCelerBridge: trade.type === CROSS_CHAIN_TRADE_TYPE.CELER
      };
    }

    throw new RubicError('[RUBIC SDK] Unknown trade provider.');
  }

  /**
   * Calculates price impact of token to 'transit token', or vice versa, trade.
   * @param token Token, selected in form.
   * @param transitToken Transit token.
   * @param tokenAmount Amount of token, selected in form.
   * @param transitTokenAmount Amount of transit token.
   * @param type 'From' or 'to' type of token in form.
   * @return number Price impact in percents.
   */
  private async calculatePriceImpact(
    token: PriceTokenAmount,
    transitToken: Token,
    tokenAmount: PriceTokenAmount,
    transitTokenAmount: BigNumber,
    type: 'from' | 'to'
  ): Promise<number> {
    // @ts-ignore @TODO SDK
    if (!compareAddresses(token.address, transitToken.address)) {
      const transitTokenPrice = await this.tokensService.getAndUpdateTokenPrice({
        address: transitToken.address,
        // @ts-ignore @TODO
        blockchain: token.blockchain
      });
      // @ts-ignore @TODO
      const priceImpactArguments: [number, number, BigNumber, BigNumber] =
        type === 'from'
          ? // @ts-ignore @TODO
            [token.price, transitTokenPrice, tokenAmount, transitTokenAmount]
          : // @ts-ignore @TODO
            [transitTokenPrice, token.price, transitTokenAmount, tokenAmount];
      return PriceImpactService.calculatePriceImpact(...priceImpactArguments);
    }
    return 0;
  }

  private async calculateSmartRouting(): Promise<void> {
    this.smartRouting = {
      fromProvider: this.crossChainTrade.trade.itType.from,
      toProvider: this.crossChainTrade.trade.itType.to,
      // @TODO SDK.
      // fromHasTrade: isPairOfCelerSupportedTransitTokens
      //   ? false
      //   : Boolean(sourceBestProvider?.tradeAndToAmount.trade),
      // toHasTrade: isPairOfCelerSupportedTransitTokens
      //   ? false
      //   : Boolean(targetBestProvider?.tradeAndToAmount.trade),
      fromHasTrade: true,
      toHasTrade: true
    };
    // const sourceBestUSDC = this.crossChainTrade.trade.to.price;
    // const toTokenUsdcPrice = await this.tokensService.getAndUpdateTokenPrice({
    //   address: toToken,
    //   blockchain: toBlockchain
    // });
    // const hasSourceTrades = Boolean(sourceBlockchainProviders[0]?.tradeAndToAmount.trade);
    // const hasTargetTrades = Boolean(targetBlockchainProviders[0]?.tradeAndToAmount.trade);
  }
}
