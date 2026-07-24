import { BlockchainName, OnChainTradeType } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { CrossChainTransferData } from '../../../cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-payment-info';
import { TradeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/trade-info';
import { OnChainTransferTrade } from '../../../on-chain/calculation-manager/common/on-chain-transfer-trade/on-chain-transfer-trade';
import { OnChainTransferConfig } from '../../../on-chain/calculation-manager/common/on-chain-transfer-trade/models/on-chain-transfer-config';
import { ApiOnChainConstructor } from '../../models/api-on-chain-constructor';
import { TransferSwapRequestInterface } from './models/transfer-swap-request-interface';
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
      ...(fromAddress && { fromAddress }),
      ...(refundAddress && { refundAddress })
    };
    const { estimate, transaction } = await this.fetchSwapData<OnChainTransferConfig>(
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
