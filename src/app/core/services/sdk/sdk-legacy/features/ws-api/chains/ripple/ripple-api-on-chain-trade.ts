import { OnChainTradeType, PriceTokenAmount, RippleBlockchainName } from '@cryptorubic/core';
import { FeeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from '../../../cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { SdkLegacyService } from '../../../../sdk-legacy.service';
import { RubicApiService } from '../../../../rubic-api/rubic-api.service';
import { RippleOnChainTrade } from '../../../on-chain/calculation-manager/common/on-chain-trade/ripple-on-chain-trade/ripple-on-chain-trade';
import { RippleApiOnChainConstructor } from './ripple-api-on-chain-constructor';

export class RippleApiOnChainTrade extends RippleOnChainTrade {
  public override readonly feeInfo: FeeInfo;

  public override readonly from: PriceTokenAmount<RippleBlockchainName>;

  public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

  public override readonly to: PriceTokenAmount<RippleBlockchainName>;

  public readonly type: OnChainTradeType;

  private readonly _priceImpact: number | null;

  public override get priceImpact(): number | null {
    return this._priceImpact;
  }

  public readonly slippage: number;

  public readonly dexContractAddress = '';

  constructor(
    params: RippleApiOnChainConstructor,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService
  ) {
    super(
      {
        ...params,
        slippageTolerance: params.apiQuote.slippage || 0,
        gasFeeInfo: null,
        useProxy: false,
        withDeflation: { from: { isDeflation: false }, to: { isDeflation: false } },
        path: params.routePath
      },
      sdkLegacyService,
      rubicApiService
    );

    this.type = params.apiResponse.providerType as OnChainTradeType;
    this._priceImpact = params.apiResponse.estimate.priceImpact;
    this.slippage = params.apiResponse.estimate.slippage;

    this.to = params.to;
    this.feeInfo = params.feeInfo;
    this.from = params.from;
  }
}
