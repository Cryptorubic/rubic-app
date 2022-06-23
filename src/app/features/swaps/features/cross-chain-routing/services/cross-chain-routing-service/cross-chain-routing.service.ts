import { Injectable } from '@angular/core';
import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';
import {
  BlockchainName,
  CelerRubicCrossChainTrade,
  compareAddresses,
  CROSS_CHAIN_TRADE_TYPE
} from 'rubic-sdk';
import { RubicCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-trade-provider';
import { CelerCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-trade-provider';
import { SymbiosisCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade-provider';
import { WrappedCrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import { RubicError } from '@core/errors/models/rubic-error';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import {
  CelerRubicTradeInfo,
  SymbiosisTradeInfo
} from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade-info';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { SymbiosisCrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade';
import { SmartRouting } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/smart-routing.interface';
import { CrossChainOptions } from 'rubic-sdk/lib/features/cross-chain/models/cross-chain-options';

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
    const options: CrossChainOptions = {
      fromSlippageTolerance: slippageTolerance / 2,
      toSlippageTolerance: slippageTolerance / 2,
      slippageTolerance
    };

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
      const { fromTrade, toTrade, feeInPercents, cryptoFeeToken } =
        trade as CelerRubicCrossChainTrade;
      const fromProvider = fromTrade.provider.type;
      const toProvider = toTrade.provider.type;

      const feeAmount = toTrade.toTokenAmountMin
        .multipliedBy(feeInPercents)
        .dividedBy(1 - feeInPercents);

      const priceImpactFrom = PriceImpactService.calculatePriceImpact(
        fromTrade.fromToken.price,
        fromTrade.toToken.price,
        fromTrade.fromToken.tokenAmount,
        fromTrade.toToken.tokenAmount
      );

      const priceImpactTo = PriceImpactService.calculatePriceImpact(
        toTrade.fromToken.price,
        toTrade.toToken.price,
        toTrade.fromToken.tokenAmount,
        toTrade.toToken.tokenAmount
      );

      const fromPath: null = null;
      const toPath: null = null;

      // @TODO SDK
      // const fromPath = trade.fromTrade ? trade.fromTrade.path.map(token => token.symbol) : null;
      // const toPath = trade.toTrade ? trade.toTrade.path.map(token => token.symbol) : null;

      return {
        feePercent: feeInPercents,
        feeAmount,
        feeTokenSymbol: cryptoFeeToken.symbol,
        cryptoFee: cryptoFeeToken.tokenAmount,
        estimatedGas,
        priceImpactFrom: Number.isNaN(priceImpactFrom) ? 0 : priceImpactFrom,
        priceImpactTo: Number.isNaN(priceImpactTo) ? 0 : priceImpactTo,
        fromProvider,
        toProvider,
        fromPath,
        toPath,
        usingCelerBridge: trade.type === CROSS_CHAIN_TRADE_TYPE.CELER
      };
    }

    throw new RubicError('[RUBIC SDK] Unknown trade provider.');
  }

  private async calculateSmartRouting(): Promise<void> {
    if (this.crossChainTrade.trade.type === CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS) {
      this.smartRouting = {
        fromProvider: 'ONE_INCH_BSC',
        toProvider: 'ONE_INCH_ETHEREUM',
        fromHasTrade: true,
        toHasTrade: true
      };
    } else {
      this.smartRouting = {
        fromProvider: this.crossChainTrade.trade.itType.from,
        toProvider: this.crossChainTrade.trade.itType.to,
        fromHasTrade: !compareAddresses(
          this.crossChainTrade.trade.fromTrade.fromToken.address,
          this.crossChainTrade.trade.fromTrade.toToken.address
        ),
        toHasTrade: !compareAddresses(
          this.crossChainTrade.trade.toTrade.fromToken.address,
          this.crossChainTrade.trade.toTrade.toToken.address
        )
      };
    }
  }

  public async approve(): Promise<void> {
    this.crossChainTrade.trade.approve();
  }
}
