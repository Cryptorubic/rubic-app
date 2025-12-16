import { OnChainTradeType, PriceTokenAmount, StellarBlockchainName } from '@cryptorubic/core';
import { FeeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from '../../../cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { SdkLegacyService } from '../../../../sdk-legacy.service';
import { RubicApiService } from '../../../../rubic-api/rubic-api.service';
import { StellarOnChainTrade } from '../../../on-chain/calculation-manager/common/on-chain-trade/stellar-on-chain-trade/stellar-on-chain-trade';
import { StellarApiOnChainConstructor } from './stellar-api-on-chain-constructor';

export class StellarApiOnChainTrade extends StellarOnChainTrade {
  public override readonly feeInfo: FeeInfo;

  public override readonly from: PriceTokenAmount<StellarBlockchainName>;

  public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

  public override readonly to: PriceTokenAmount<StellarBlockchainName>;

  public readonly type: OnChainTradeType;

  private readonly _priceImpact: number | null;

  public override get priceImpact(): number | null {
    return this._priceImpact;
  }

  public readonly slippage: number;

  public readonly dexContractAddress = '';

  constructor(
    params: StellarApiOnChainConstructor,
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
      params.apiQuote.integratorAddress!,
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
