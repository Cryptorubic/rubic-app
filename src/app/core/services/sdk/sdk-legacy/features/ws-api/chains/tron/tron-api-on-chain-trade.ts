import { OnChainTradeType, PriceTokenAmount, TronBlockchainName } from '@cryptorubic/core';
import { GasData } from '../../../cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from '../../../cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { RubicStep } from '../../../cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TronOnChainTrade } from '../../../on-chain/calculation-manager/common/on-chain-trade/tron-on-chain-trade/tron-on-chain-trade';
import { TronApiOnChainConstructor } from './tron-api-on-chain-constructor';
import { SdkLegacyService } from '../../../../sdk-legacy.service';
import { RubicApiService } from '../../../../rubic-api/rubic-api.service';

export class TronApiOnChainTrade extends TronOnChainTrade {
  public readonly feeInfo: FeeInfo;

  public readonly from: PriceTokenAmount<TronBlockchainName>;

  public readonly gasData: GasData;

  public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

  public readonly to: PriceTokenAmount<TronBlockchainName>;

  public readonly type: OnChainTradeType;

  private readonly _priceImpact: number | null;

  public override get priceImpact(): number | null {
    return this._priceImpact;
  }

  public readonly slippageTolerance: number;

  public readonly isAggregator = false;

  public readonly dexContractAddress = '';

  public readonly path: RubicStep[];

  public readonly spenderAddress: string;

  constructor(
    params: TronApiOnChainConstructor,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService
  ) {
    super(params.apiQuote, params.apiResponse, sdkLegacyService, rubicApiService);

    this.type = params.apiResponse.providerType as OnChainTradeType;
    this._priceImpact = params.apiResponse.estimate.priceImpact;
    this.slippageTolerance = params.apiResponse.estimate.slippage;

    this.to = params.to;
    this.feeInfo = params.feeInfo;
    this.from = params.from;
    this.gasData = null;
    this.path = params.routePath;
    this.spenderAddress = params.apiResponse.transaction.approvalAddress || '';
  }
}
