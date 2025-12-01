import { PriceTokenAmount, Token, TonBlockchainName } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { CrossChainTradeType } from '../../../cross-chain/calculation-manager/models/cross-chain-trade-type';
import { GasData } from '../../../cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from '../../../cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/trade-info';
import { TonCrossChainTrade } from '../../../cross-chain/calculation-manager/providers/common/ton-cross-chain-trade/ton-cross-chain-trade';
import { TonApiCrossChainConstructor } from './ton-api-cross-chain-constructor';
import { SdkLegacyService } from '../../../../sdk-legacy.service';
import { RubicApiService } from '../../../../rubic-api/rubic-api.service';

export class TonApiCrossChainTrade extends TonCrossChainTrade {
  public readonly feeInfo: FeeInfo;

  public readonly from: PriceTokenAmount<TonBlockchainName>;

  public readonly gasData: GasData;

  public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

  public readonly to: PriceTokenAmount;

  public readonly toTokenAmountMin: BigNumber;

  public readonly type: CrossChainTradeType;

  public readonly priceImpact: number | null;

  public readonly slippage: number;

  public readonly bridgeType: CrossChainTradeType;

  public readonly isAggregator = false;

  constructor(
    params: TonApiCrossChainConstructor,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService
  ) {
    super(
      params.apiQuote.integratorAddress!,
      params.routePath,
      params.apiQuote,
      params.apiResponse,
      sdkLegacyService,
      rubicApiService
    );

    this.type = params.apiResponse.providerType as CrossChainTradeType;
    this.bridgeType = this.type;
    this.toTokenAmountMin = Token.fromWei(
      params.apiResponse.estimate.destinationWeiMinAmount,
      params.to.decimals
    );
    this.priceImpact = params.apiResponse.estimate.priceImpact;
    this.slippage = params.apiResponse.estimate.slippage;

    this.to = params.to;
    this.feeInfo = params.feeInfo;
    this.from = params.from;
    this.gasData = null;
  }

  public getTradeInfo(): TradeInfo {
    return {
      estimatedGas: null,
      feeInfo: this.feeInfo,
      priceImpact: this.priceImpact,
      slippage: this.slippage * 100,
      routePath: this.routePath
    };
  }
}
