import { BlockchainsInfo, SwapRequestInterface } from '@cryptorubic/core';
import { EvmTransactionConfig, UserRejectError } from '@cryptorubic/web3';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { SwapTransactionOptions } from '../../../../common/models/swap-transaction-options';
import { EvmApiCrossChainTrade } from '../../../../ws-api/chains/evm/evm-api-cross-chain-trade';
import { OmnistonSignedOrderTransaction, OmnistonTypedData } from './models/omniston-typed-data';
import { getOmnistonTypedData, OmnistonSignedOrder } from './omniston-signed-order';

export class OmnistonEvmCrossChainTrade extends EvmApiCrossChainTrade {
  private readonly order = new OmnistonSignedOrder(this.rubicApiService);

  private typedData: OmnistonTypedData | null = null;

  public override get usesSignedOrder(): boolean {
    return true;
  }

  public override async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
    const exchangeId = await this.order.submit(
      () => this.prepareAndSign(options),
      () => this.rubicId
    );

    this._exchangeId = exchangeId;
    options.onConfirm?.(exchangeId);

    return exchangeId;
  }

  private async prepareAndSign(options: SwapTransactionOptions): Promise<string> {
    if (!options.testMode) {
      await this.checkTradeErrors();
    }
    await this.checkReceiverAddress(
      options.receiverAddress,
      !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
    );

    await this.encode({ ...options, fromAddress: this.walletAddress });

    const allowedToSign = await options.onSimulationSuccess?.();
    if (!allowedToSign) throw new UserRejectError('manual transaction reject');

    const { domain, types, message, primaryType } = this.typedData!;

    return this.order.requestSignature(() =>
      this.chainAdapter.signer.wallet.signTypedData({
        account: this.walletAddress as `0x${string}`,
        domain,
        types,
        message,
        primaryType
      } as RubicAny)
    );
  }

  protected override async getTransactionConfigAndAmount(
    testMode?: boolean,
    receiverAddress?: string
  ): Promise<{ config: EvmTransactionConfig; amount: string }> {
    const swapRequestData: SwapRequestInterface = {
      ...this.apiQuote,
      fromAddress: this.walletAddress,
      receiver: receiverAddress,
      id: this.apiResponse.id,
      enableChecks: !testMode
    };
    const { transaction, estimate } =
      await this.fetchSwapData<OmnistonSignedOrderTransaction>(swapRequestData);

    this.typedData = getOmnistonTypedData(transaction);
    this._exchangeId = transaction.exchangeId;

    return {
      config: transaction as EvmTransactionConfig,
      amount: estimate.destinationWeiAmount
    };
  }
}
