import {
  BlockchainName,
  OnChainTradeType,
  PrivateTransactionInterface,
  SwapPrivateRequestInterface
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { CrossChainTransferData } from '../../../cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-payment-info';
import { TradeInfo } from '../../../cross-chain/calculation-manager/providers/common/models/trade-info';
import { OnChainTransferTrade } from '../../../on-chain/calculation-manager/common/on-chain-transfer-trade/on-chain-transfer-trade';
import { ApiOnChainConstructor } from '../../models/api-on-chain-constructor';
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
    _fromAddress?: string,
    refundAddress?: string
  ): Promise<CrossChainTransferData> {
    const swapRequestData: SwapPrivateRequestInterface = {
      ...this.apiQuote,
      id: this.apiResponse.id,
      receiver: receiverAddress,
      refundAddress: refundAddress || '',
      enableChecks: !testMode
    };

    const { estimate, transaction } =
      await this.rubicApiService.fetchSwapPrivateTrade(swapRequestData);

    const amount = estimate.destinationTokenAmount;
    this.actualTokenAmount = new BigNumber(amount);

    const extraFields = this.parsePrivateExtraFields(transaction);

    return {
      toAmount: amount,
      id: this.apiResponse.id,
      depositAddress: transaction.depositAddress,
      depositExtraId: extraFields?.value,
      depositExtraIdName: extraFields?.name
    };
  }

  private parsePrivateExtraFields(
    transaction: PrivateTransactionInterface
  ): { name: string; value: string } | undefined {
    const extraFields = transaction.extraFields as { name?: string; value?: string } | undefined;
    if (!extraFields?.name || !extraFields?.value) {
      return undefined;
    }
    return { name: extraFields.name, value: extraFields.value };
  }
}
