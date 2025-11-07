import { PriceTokenAmount, SolanaBlockchainName } from '@cryptorubic/core';
import { GasData } from '../../../cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from '../../../cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { SolanaOnChainTrade } from '../../../on-chain/calculation-manager/common/on-chain-trade/solana-on-chain-trade/solana-on-chain-trade';
import { OnChainTradeType } from '../../../on-chain/calculation-manager/models/on-chain-trade-type';
import { SolanaApiOnChainConstructor } from './solana-api-on-chain-constructor';
import { SdkLegacyService } from '../../../../sdk-legacy.service';
import { RubicApiService } from '../../../../rubic-api/rubic-api.service';

export class SolanaApiOnChainTrade extends SolanaOnChainTrade {
  public override readonly feeInfo: FeeInfo;

  public override readonly from: PriceTokenAmount<SolanaBlockchainName>;

  public readonly gasData: GasData;

  public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

  public override readonly to: PriceTokenAmount<SolanaBlockchainName>;

  public readonly type: OnChainTradeType;

  private readonly _priceImpact: number | null;

  public override get priceImpact(): number | null {
    return this._priceImpact;
  }

  public readonly slippage: number;

  public readonly dexContractAddress = '';

  constructor(
    params: SolanaApiOnChainConstructor,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService
  ) {
    super(
      {
        ...params,
        slippageTolerance: params.apiQuote.slippage || 0,
        fromWithoutFee: params.from,
        path: params.routePath,
        useProxy: false,
        gasFeeInfo: null,
        withDeflation: { from: { isDeflation: false }, to: { isDeflation: false } }
      },
      params.apiQuote.integratorAddress!,
      params.shouldCalculateConsumedParams,
      sdkLegacyService,
      rubicApiService
    );

    this.type = params.apiResponse.providerType as OnChainTradeType;
    this._priceImpact = params.apiResponse.estimate.priceImpact;
    this.slippage = params.apiResponse.estimate.slippage;

    this.to = params.to;
    this.feeInfo = params.feeInfo;
    this.from = params.from;
    this.gasData = null;
  }
}
