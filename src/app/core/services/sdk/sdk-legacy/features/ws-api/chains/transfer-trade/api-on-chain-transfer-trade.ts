import { BlockchainName, OnChainTradeType } from '@cryptorubic/core';
import { TradeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/trade-info';
import { OnChainTransferTrade } from '../../../on-chain/calculation-manager/common/on-chain-transfer-trade/on-chain-transfer-trade';
import { ApiOnChainConstructor } from '../../models/api-on-chain-constructor';
import { SdkLegacyService } from '../../../../sdk-legacy.service';
import { RubicApiService } from '../../../../rubic-api/rubic-api.service';

export class ApiOnChainTransferTrade extends OnChainTransferTrade {
  public readonly type: OnChainTradeType;

  constructor(
    tradeParams: Omit<ApiOnChainConstructor<BlockchainName>, 'useProxy'>,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService
  ) {
    super(
      tradeParams.from,
      tradeParams.to,
      tradeParams.feeInfo,
      tradeParams.routePath,
      tradeParams.apiResponse.estimate.slippage,
      tradeParams.apiQuote,
      tradeParams.apiResponse,
      sdkLegacyService,
      rubicApiService
    );

    this.type = tradeParams.apiResponse.providerType as OnChainTradeType;
  }

  public override getTradeInfo(): TradeInfo {
    return {
      estimatedGas: null,
      feeInfo: this.feeInfo,
      priceImpact: this.priceImpact ?? null,
      slippage: this.slippageTolerance * 100,
      routePath: this.path
    };
  }
}
