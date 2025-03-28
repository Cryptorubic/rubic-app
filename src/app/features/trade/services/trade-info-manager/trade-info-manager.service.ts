import { Injectable } from '@angular/core';
import {
  BLOCKCHAIN_NAME,
  CrossChainTrade,
  CrossChainTradeType,
  EvmCrossChainTrade,
  EvmOnChainTrade,
  OnChainTrade,
  Web3Pure,
  nativeTokensList
} from 'rubic-sdk';
import { compareTokens } from '@app/shared/utils/utils';
import { TokensStoreService } from '@app/core/services/tokens/tokens-store.service';
import { TRADES_PROVIDERS } from '../../constants/trades-providers';
import { AppFeeInfo, AppGasData, ProviderInfo } from '../../models/provider-info';
import { TradeProvider } from '../../models/trade-provider';
import { PlatformConfigurationService } from '@app/core/services/backend/platform-configuration/platform-configuration.service';

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

  public getProviderInfo(tradeType: TradeProvider): ProviderInfo {
    const provider = TRADES_PROVIDERS[tradeType];
    const providerAverageTime = this.platformConfigurationService.providersAverageTime;
    const currentProviderTime = providerAverageTime?.[tradeType as CrossChainTradeType];
    return {
      ...provider,
      averageTime: currentProviderTime ? currentProviderTime : provider.averageTime
    };
  }

  public getGasData(trade: CrossChainTrade | OnChainTrade): AppGasData | null {
    let gasData = null;
    let gasPrice = null;
    if (trade instanceof EvmCrossChainTrade) {
      gasData = trade.gasData;

      if (
        trade.from.blockchain !== BLOCKCHAIN_NAME.ETHEREUM &&
        trade.from.blockchain !== BLOCKCHAIN_NAME.FANTOM
      ) {
        gasPrice = gasData?.gasPrice?.gt(0)
          ? Web3Pure.fromWei(gasData.gasPrice)
          : Web3Pure.fromWei(gasData?.maxFeePerGas || 0);
      } else {
        gasPrice = gasData?.gasPrice?.gt(0)
          ? gasData.gasPrice
          : Web3Pure.fromWei(gasData?.maxFeePerGas || 0);
      }
    } else if (trade instanceof EvmOnChainTrade) {
      gasData = trade.gasFeeInfo;
      gasPrice = gasData?.gasPrice?.gt(0) ? gasData.gasPrice : gasData?.maxFeePerGas;
    }

    if (!gasData || !gasData.gasLimit) {
      return null;
    }
    const blockchain = trade.from.blockchain;
    const nativeToken = nativeTokensList[blockchain];
    const nativeTokenPrice = this.tokensStoreService.tokens.find(token =>
      compareTokens(token, { blockchain, address: nativeToken.address })
    ).price;
    const gasLimit = gasData?.gasLimit?.multipliedBy(gasPrice);

    return {
      amount: gasLimit,
      amountInUsd: gasLimit.multipliedBy(nativeTokenPrice),
      symbol: nativeToken.symbol
    };
  }
}
