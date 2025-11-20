import { Injectable } from '@angular/core';
import {
  CrossChainTrade,
  EvmCrossChainTrade,
  EvmOnChainTrade,
  OnChainTrade,
  Token,
  TonOnChainTrade,
  Web3Pure,
  nativeTokensList
} from '@cryptorubic/sdk';
import { compareTokens } from '@app/shared/utils/utils';
import { TokensStoreService } from '@app/core/services/tokens/tokens-store.service';
import { TRADES_PROVIDERS } from '../../constants/trades-providers';
import { AppFeeInfo, AppGasData, ProviderInfo } from '../../models/provider-info';
import { PlatformConfigurationService } from '@app/core/services/backend/platform-configuration/platform-configuration.service';
import BigNumber from 'bignumber.js';

@Injectable()
export class TradeInfoManager {
  constructor(
    private readonly tokensStoreService: TokensStoreService,
    private readonly platformConfigurationService: PlatformConfigurationService
  ) {}

  public getFeeInfo(trade: CrossChainTrade | OnChainTrade): AppFeeInfo {
    const nativeToken = this.tokensStoreService.getNativeToken(trade.from.blockchain);
    return {
      fee: trade.feeInfo,
      nativeToken: nativeToken
    };
  }

  public getProviderInfo(trade: CrossChainTrade | OnChainTrade): ProviderInfo {
    const provider = TRADES_PROVIDERS[trade.type];
    return { ...provider, averageTime: this.getAverageSwapTimeMinutes(trade).averageTimeMins };
  }

  public getAverageSwapTimeMinutes(trade: CrossChainTrade | OnChainTrade): {
    averageTimeMins: number;
    time95PercentsSwapsMins: number;
  } {
    const provider = TRADES_PROVIDERS[trade.type];

    if (trade instanceof CrossChainTrade) {
      const ccrProviders = this.platformConfigurationService.ccrProvidersInfo;
      const ccrProviderInfo = ccrProviders[trade.type];
      const fromToChainKey = `${trade.from.blockchain}-${trade.to.blockchain}`;
      const betweenChainsInfo = ccrProviderInfo.betweenNetworksStats[fromToChainKey];

      const getAverageTimeMinutes = (): number => {
        let averageTimeMinutes = 0;
        if (betweenChainsInfo) {
          averageTimeMinutes = Math.min(
            Math.ceil(Number(betweenChainsInfo.average) / 60),
            Math.ceil(Number(betweenChainsInfo.median) / 60)
          );
        } else if (ccrProviderInfo.median) {
          averageTimeMinutes = Math.ceil(Number(ccrProviderInfo.median) / 60);
        } else if (ccrProviderInfo.average) {
          averageTimeMinutes = Math.ceil(Number(ccrProviderInfo.average) / 60);
        } else if (ccrProviderInfo.averageExecutionTime) {
          averageTimeMinutes = ccrProviderInfo.averageExecutionTime;
        } else {
          averageTimeMinutes = 5;
        }

        return averageTimeMinutes;
      };

      const averageTimeMins = getAverageTimeMinutes();
      const time95PercentsSwapsMins = betweenChainsInfo
        ? Math.ceil(betweenChainsInfo['95_percentile'] / 60)
        : Math.ceil(ccrProviderInfo['95_percentile'] / 60)
        ? Math.ceil(ccrProviderInfo['95_percentile'] / 60)
        : averageTimeMins;

      return { averageTimeMins, time95PercentsSwapsMins };
    } else {
      return {
        // Default average time if not specified
        averageTimeMins: provider?.averageTime || 1,
        time95PercentsSwapsMins: provider?.averageTime || 1
      };
    }
  }

  public getGasData(trade: CrossChainTrade | OnChainTrade): AppGasData | null {
    const estimatedGasInWei = trade.getTradeInfo().estimatedGas;

    if ((!('gasData' in trade) && !('gasFeeInfo' in trade)) || !estimatedGasInWei) return null;

    const blockchain = trade.from.blockchain;
    const nativeToken = nativeTokensList[blockchain];
    const nativeTokenPrice = this.tokensStoreService.tokens.find(token =>
      compareTokens(token, { blockchain, address: nativeToken.address })
    ).price;

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
