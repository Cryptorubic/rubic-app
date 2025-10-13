import { Injectable } from '@angular/core';
import {
  CrossChainTrade,
  CrossChainTradeType,
  EvmCrossChainTrade,
  EvmOnChainTrade,
  OnChainTrade,
  Token,
  TonOnChainTrade,
  Web3Pure,
  nativeTokensList
} from '@cryptorubic/sdk';
import { TRADES_PROVIDERS } from '../../constants/trades-providers';
import { AppFeeInfo, AppGasData, ProviderInfo } from '../../models/provider-info';
import { TradeProvider } from '../../models/trade-provider';
import { PlatformConfigurationService } from '@app/core/services/backend/platform-configuration/platform-configuration.service';
import BigNumber from 'bignumber.js';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';

@Injectable()
export class TradeInfoManager {
  constructor(
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly tokensFacade: TokensFacadeService
  ) {}

  public getFeeInfo(trade: CrossChainTrade | OnChainTrade): AppFeeInfo {
    const nativeBaseToken = nativeTokensList[trade.from.blockchain];
    const nativeToken = this.tokensFacade.findTokenSync(nativeBaseToken);
    return {
      fee: trade.feeInfo,
      nativeToken: nativeToken
    };
  }

  public getProviderInfo(tradeType: TradeProvider): ProviderInfo {
    const provider = TRADES_PROVIDERS[tradeType];
    const providerAverageTime = this.platformConfigurationService.providersAverageTime;
    const currentProviderTime = providerAverageTime?.[tradeType as CrossChainTradeType];
    return {
      ...provider,
      averageTime: currentProviderTime ? currentProviderTime : provider?.averageTime || 1 // Default average time if not specified
    };
  }

  public getGasData(trade: CrossChainTrade | OnChainTrade): AppGasData | null {
    const estimatedGasInWei = trade.getTradeInfo().estimatedGas;

    if ((!('gasData' in trade) && !('gasFeeInfo' in trade)) || !estimatedGasInWei) return null;

    const blockchain = trade.from.blockchain;
    const nativeToken = nativeTokensList[blockchain];
    const nativeTokenPrice = this.tokensFacade.findTokenSync(nativeToken).price;

    if (estimatedGasInWei) {
      const estimatedGas = Web3Pure.fromWei(estimatedGasInWei, nativeToken.decimals);
      return {
        amount: estimatedGas,
        amountInUsd: estimatedGas.multipliedBy(nativeTokenPrice),
        symbol: nativeToken.symbol
      };
    }

    let gasFeeNonWei = null;
    if (trade instanceof EvmCrossChainTrade) {
      gasFeeNonWei = this.getCcrGasFee(trade, nativeToken);
    } else if (trade instanceof EvmOnChainTrade || trade instanceof TonOnChainTrade) {
      gasFeeNonWei = this.getOnChainGasFee(trade, nativeToken);
    }

    if (!gasFeeNonWei || gasFeeNonWei.lte(0)) return null;

    return {
      amount: gasFeeNonWei,
      amountInUsd: gasFeeNonWei.multipliedBy(nativeTokenPrice),
      symbol: nativeToken.symbol
    };
  }

  /**
   * In trade.gasData:
   * totalGas - in wei
   * gasLimit - in wei
   * gasPrice - in wei
   * maxFeePerGas - in wei
   * @returns gasFee non wei
   */
  private getCcrGasFee(trade: EvmCrossChainTrade, nativeToken: Token): BigNumber | null {
    const gasData = trade.gasData;
    if (!gasData) return null;

    let gasFeeWei: BigNumber | null = null;
    if ('totalGas' in gasData) {
      gasFeeWei = gasData.totalGas;
    } else if ('gasPrice' in gasData && gasData.gasPrice.gt(0)) {
      gasFeeWei = gasData.gasLimit?.multipliedBy(gasData.gasPrice);
    } else if ('maxFeePerGas' in gasData && gasData.maxFeePerGas.gt(0)) {
      gasFeeWei = gasData.gasLimit?.multipliedBy(gasData.maxFeePerGas || 0);
    }

    if (!gasFeeWei) return null;

    return Web3Pure.fromWei(gasFeeWei, nativeToken.decimals);
  }

  /**
   * In trade.gasFeeInfo:
   * totalGas - in wei
   * gasLimit - in wei
   * gasPrice - in wei
   * maxFeePerGas - in wei
   * @returns gasFee non wei
   */
  private getOnChainGasFee(
    trade: EvmOnChainTrade | TonOnChainTrade,
    nativeToken: Token
  ): BigNumber | null {
    const gasData = trade.gasFeeInfo;
    if (!gasData) return null;

    if (gasData.totalGas) return Web3Pure.fromWei(gasData.totalGas, nativeToken.decimals);

    if (!gasData.gasLimit) return null;

    let gasFeeWei = null;
    if ('gasPrice' in gasData && gasData.gasPrice.gt(0)) {
      gasFeeWei = gasData.gasLimit.multipliedBy(gasData.gasPrice);
    } else if ('maxFeePerGas' in gasData && gasData.maxFeePerGas.gt(0)) {
      gasFeeWei = gasData.gasLimit.multipliedBy(gasData.maxFeePerGas);
    }

    return Web3Pure.fromWei(gasFeeWei, nativeToken.decimals);
  }
}
