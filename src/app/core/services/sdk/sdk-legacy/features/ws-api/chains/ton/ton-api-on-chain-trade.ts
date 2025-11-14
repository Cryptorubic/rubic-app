import { OnChainTradeType, PriceTokenAmount, TonBlockchainName } from '@cryptorubic/core';
import { EncodeTransactionOptions } from '../../../common/models/encode-transaction-options';
import { GasData } from '../../../cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from '../../../cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TonOnChainTrade } from '../../../on-chain/calculation-manager/common/on-chain-trade/ton-on-chain-trade/ton-on-chain-trade';
import { TonApiOnChainConstructor } from './ton-api-on-chain-constructor';
import { SdkLegacyService } from '../../../../sdk-legacy.service';
import { RubicApiService } from '../../../../rubic-api/rubic-api.service';

export class TonApiOnChainTrade extends TonOnChainTrade {
  public override readonly feeInfo: FeeInfo;

  public override readonly from: PriceTokenAmount<TonBlockchainName>;

  public readonly gasData: GasData;

  public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

  public override readonly to: PriceTokenAmount<TonBlockchainName>;

  public readonly type: OnChainTradeType;

  private readonly _priceImpact: number | null;

  public override get priceImpact(): number | null {
    return this._priceImpact;
  }

  public readonly slippage: number;

  public readonly dexContractAddress = '';

  constructor(
    params: TonApiOnChainConstructor,
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
        routingPath: params.routePath,
        isChangedSlippage: params.isChangedSlippage
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
    this.gasData = null;
  }

  protected calculateOutputAmount(_options: EncodeTransactionOptions): Promise<string> {
    // @TODO API
    throw new Error('Not implemented');
  }
}
