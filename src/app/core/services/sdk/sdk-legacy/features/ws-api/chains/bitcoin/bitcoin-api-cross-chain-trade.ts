import { BitcoinBlockchainName, PriceTokenAmount, Token } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { CrossChainTradeType } from '../../../cross-chain/calculation-manager/models/cross-chain-trade-type';
import { BitcoinCrossChainTrade } from '../../../cross-chain/calculation-manager/providers/common/bitcoin-cross-chain-trade/bitcoin-cross-chain-trade';
import { BridgeType } from '../../../cross-chain/calculation-manager/providers/common/models/bridge-type';
import { FeeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from '../../../cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/trade-info';

import { BitcoinApiCrossChainConstructor } from './bitcoin-api-cross-chain-constructor';
import { SdkLegacyService } from '../../../../sdk-legacy.service';

export class BitcoinApiCrossChainTrade extends BitcoinCrossChainTrade {
  public readonly type: CrossChainTradeType;

  public readonly from: PriceTokenAmount<BitcoinBlockchainName>;

  public readonly to: PriceTokenAmount;

  public readonly toTokenAmountMin: BigNumber;

  public bridgeType: BridgeType;

  public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

  public readonly priceImpact: number | null;

  public readonly slippage: number;

  public readonly feeInfo: FeeInfo;

  protected readonly needProvidePubKey: boolean;

  public readonly isAggregator = false;

  //@TODO API
  public memo = '';

  constructor(tradeParams: BitcoinApiCrossChainConstructor, sdkLegacyService: SdkLegacyService) {
    super(
      tradeParams.apiQuote.integratorAddress!,
      tradeParams.routePath,
      tradeParams.apiQuote,
      tradeParams.apiResponse,
      sdkLegacyService
    );

    this.type = tradeParams.apiResponse.providerType as CrossChainTradeType;
    this.bridgeType = this.type;
    this.from = tradeParams.from;
    this.to = tradeParams.to;
    this.toTokenAmountMin = Token.fromWei(
      tradeParams.apiResponse.estimate.destinationWeiMinAmount,
      tradeParams.to.decimals
    );

    this.priceImpact = tradeParams.apiResponse.estimate.priceImpact;
    this.slippage = tradeParams.apiResponse.estimate.slippage;
    this.feeInfo = tradeParams.feeInfo;
    this.needProvidePubKey = tradeParams.needProvidePubKey;
  }

  public getTradeInfo(): TradeInfo {
    return {
      estimatedGas: this.estimatedGas,
      feeInfo: this.feeInfo,
      priceImpact: this.priceImpact,
      slippage: this.slippage * 100,
      routePath: this.routePath
    };
  }
}
