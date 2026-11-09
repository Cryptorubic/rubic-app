import { SwapRequestInterface } from '@cryptorubic/core';
import { TronTransactionConfig } from '@cryptorubic/web3';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { SwapTransactionOptions } from '../../../../common/models/swap-transaction-options';
import { TronApiCrossChainTrade } from '../../../../ws-api/chains/tron/tron-api-cross-chain-trade';
import { MarkRequired } from '../../models/utility-types';
import { OmnistonSignedOrderTransaction, OmnistonTypedData } from './models/omniston-typed-data';
import { getOmnistonTypedData, OmnistonSignedOrder } from './omniston-signed-order';

export class OmnistonTronCrossChainTrade extends TronApiCrossChainTrade {
  private readonly order = new OmnistonSignedOrder(this.rubicApiService);

  private typedData: OmnistonTypedData | null = null;

  public override get usesSignedOrder(): boolean {
    return true;
  }

  public override async swap(
    options: MarkRequired<SwapTransactionOptions, 'receiverAddress'>
  ): Promise<string | never> {
    const exchangeId = await this.order.submit(
      () => this.prepareAndSign(options),
      () => this.rubicId
    );

    this._exchangeId = exchangeId;
    options.onConfirm?.(exchangeId);

    return exchangeId;
  }

  private async prepareAndSign(
    options: MarkRequired<SwapTransactionOptions, 'receiverAddress'>
  ): Promise<string> {
    if (!options.testMode) {
      await this.checkTradeErrors();
    }
    await this.checkReceiverAddress(options.receiverAddress, true);

    await this.encode({ ...options, fromAddress: this.walletAddress });

    const { domain, types, message } = this.typedData!;
    const { EIP712Domain: _domainType, ...orderTypes } = types;

    return this.order.requestSignature(async () =>
      this.chainAdapter.signer.wallet.trx._signTypedData(domain as RubicAny, orderTypes, message)
    );
  }

  protected override async getTransactionConfigAndAmount(
    testMode?: boolean,
    receiverAddress?: string
  ): Promise<{ config: TronTransactionConfig; amount: string }> {
    const swapRequestParams: SwapRequestInterface = {
      ...this.apiQuote,
      fromAddress: this.walletAddress,
      receiver: receiverAddress,
      id: this.apiResponse.id,
      enableChecks: !testMode
    };
    const { transaction, estimate } =
      await this.fetchSwapData<OmnistonSignedOrderTransaction>(swapRequestParams);

    this.typedData = getOmnistonTypedData(transaction);
    this._exchangeId = transaction.exchangeId;

    return {
      config: transaction as TronTransactionConfig,
      amount: estimate.destinationWeiAmount
    };
  }
}
