import { PriceTokenAmount, SolanaBlockchainName, Token } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { CrossChainTradeType } from '../../../cross-chain/calculation-manager/models/cross-chain-trade-type';
import { GasData } from '../../../cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from '../../../cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/trade-info';
import { SolanaCrossChainTrade } from '../../../cross-chain/calculation-manager/providers/common/solana-cross-chain-trade/solana-cross-chain-trade';
import { SolanaApiCrossChainConstructor } from './solana-api-cross-chain-constructor';
import { SdkLegacyService } from '../../../../sdk-legacy.service';

export class SolanaApiCrossChainTrade extends SolanaCrossChainTrade {
  public readonly feeInfo: FeeInfo;

  public readonly from: PriceTokenAmount<SolanaBlockchainName>;

  public readonly gasData: GasData;

  public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

  public readonly to: PriceTokenAmount;

  public readonly toTokenAmountMin: BigNumber;

  public readonly type: CrossChainTradeType;

  public readonly priceImpact: number | null;

  public readonly slippage: number;

  public readonly bridgeType: CrossChainTradeType;

  public readonly isAggregator = false;

  constructor(params: SolanaApiCrossChainConstructor, sdkLegacyService: SdkLegacyService) {
    super(
      params.apiQuote.integratorAddress!,
      params.routePath,
      params.apiQuote,
      params.apiResponse,
      params.shouldCalculateConsumedParams,
      sdkLegacyService
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
