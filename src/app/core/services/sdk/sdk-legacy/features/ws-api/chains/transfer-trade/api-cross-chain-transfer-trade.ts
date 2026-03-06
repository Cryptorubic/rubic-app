import { Token } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { CrossChainTradeType } from '../../../cross-chain/calculation-manager/models/cross-chain-trade-type';
import { CrossChainTransferTrade } from '../../../cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/cross-chain-transfer-trade';
import { CrossChainTransferData } from '../../../cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-payment-info';
import { CrossChainTransferConfig } from '../../../cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-transfer-config';
import { BridgeType } from '../../../cross-chain/calculation-manager/providers/common/models/bridge-type';
import { OnChainSubtype } from '../../../cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { TradeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/trade-info';

import { ApiCrossChainTransferConstructor } from './api-cross-chain-transfer-constructor';
import { TransferSwapRequestInterface } from './models/transfer-swap-request-interface';
import { SdkLegacyService } from '../../../../sdk-legacy.service';
import { RubicApiService } from '../../../../rubic-api/rubic-api.service';

export class ApiCrossChainTransferTrade extends CrossChainTransferTrade {
  public readonly type: CrossChainTradeType;

  public readonly bridgeType: BridgeType;

  public onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

  constructor(
    tradeParams: ApiCrossChainTransferConstructor,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService
  ) {
    super(
      tradeParams.apiQuote.integratorAddress!,
      tradeParams.routePath,
      null,
      tradeParams.from,
      tradeParams.to,
      Token.fromWei(
        tradeParams.apiResponse.estimate.destinationWeiMinAmount,
        tradeParams.to.decimals
      ),
      null,
      tradeParams.feeInfo,
      tradeParams.from.calculatePriceImpactPercent(tradeParams.to),
      tradeParams.apiQuote,
      tradeParams.apiResponse,
      sdkLegacyService,
      rubicApiService
    );

    this.type = tradeParams.apiResponse.providerType as CrossChainTradeType;
    this.bridgeType = tradeParams.apiResponse.providerType as CrossChainTradeType;
  }

  public getTradeInfo(): TradeInfo {
    return {
      estimatedGas: null,
      feeInfo: this.feeInfo,
      priceImpact: this.priceImpact ?? null,
      slippage: this.onChainTrade?.slippageTolerance
        ? this.onChainTrade.slippageTolerance * 100
        : 0,
      routePath: this.routePath
    };
  }

  protected async getPaymentInfo(
    receiverAddress: string,
    testMode: boolean,
    fromAddress?: string,
    refundAddress?: string
  ): Promise<CrossChainTransferData> {
    const swapRequestData: TransferSwapRequestInterface = {
      ...this.apiQuote,
      receiver: receiverAddress,
      id: this.apiResponse.id,
      enableChecks: !testMode,
      privacyRefCode: this.privacyRefCode,
      ...(fromAddress && { fromAddress }),
      ...(refundAddress && { refundAddress })
    };
    const { estimate, transaction } = await this.fetchSwapData<CrossChainTransferConfig>(
      swapRequestData
    );

    const amount = estimate.destinationTokenAmount;

    this.actualTokenAmount = new BigNumber(amount);

    return {
      toAmount: amount,
      id: transaction.exchangeId,
      depositAddress: transaction.depositAddress,
      depositExtraId: transaction.extraFields?.value,
      depositExtraIdName: transaction.extraFields?.name
    };
  }
}
