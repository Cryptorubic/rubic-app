import { PriceTokenAmount, SwapRequestInterface, TonBlockchainName } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { EncodeTransactionOptions } from '../../../../../common/models/encode-transaction-options';
import { SwapTransactionOptions } from '../../../../../common/models/swap-transaction-options';
import { CrossChainTrade } from '../cross-chain-trade';
import { TonTransactionConfig } from '../models/ton-transaction-config';
import {
  FailedToCheckForTransactionReceiptError,
  RubicSdkError,
  TonAdapter
} from '@cryptorubic/web3';

export abstract class TonCrossChainTrade extends CrossChainTrade<TonTransactionConfig> {
  public abstract override readonly from: PriceTokenAmount<TonBlockchainName>;

  protected get chainAdapter(): TonAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(this.from.blockchain);
  }

  public async encode(options: EncodeTransactionOptions): Promise<TonTransactionConfig> {
    await this.checkFromAddress(options.fromAddress, true);
    await this.checkReceiverAddress(options.receiverAddress, true);

    return this.setTransactionConfig(
      options?.skipAmountCheck || false,
      options?.useCacheData || false,
      options.testMode,
      options?.receiverAddress || this.walletAddress
    );
  }

  public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
    if (!options?.testMode) {
      await this.checkTradeErrors();
    }
    await this.checkReceiverAddress(options.receiverAddress, true);

    const fromAddress = this.walletAddress;
    const transactionConfig = await this.encode({ ...options, fromAddress });

    const { onConfirm } = options;
    let transactionHash: string;
    const onTransactionHash = (hash: string) => {
      if (onConfirm) {
        onConfirm(hash);
      }
      transactionHash = hash;
    };

    try {
      await this.chainAdapter.client.sendTransaction({
        txOptions: { messages: transactionConfig.tonMessages, onTransactionHash }
      });

      return transactionHash!;
    } catch (err) {
      if (err instanceof FailedToCheckForTransactionReceiptError) {
        return transactionHash!;
      }
      throw err;
    }
  }

  protected async getTransactionConfigAndAmount(
    testMode?: boolean,
    receiverAddress?: string
  ): Promise<{ config: TonTransactionConfig; amount: string }> {
    const swapRequestParams: SwapRequestInterface = {
      ...this.apiQuote,
      fromAddress: this.walletAddress,
      receiver: receiverAddress,
      id: this.apiResponse.id,
      enableChecks: !testMode
    };

    const swapData = await this.fetchSwapData<TonTransactionConfig>(swapRequestParams);

    this._uniqueInfo = swapData.uniqueInfo ?? {};
    const toAmount = swapData.estimate.destinationWeiAmount;

    return { config: swapData.transaction, amount: toAmount };
  }

  public override getUsdPrice(providerFeeToken?: BigNumber): BigNumber {
    let feeSum = new BigNumber(0);
    const providerFee = this.feeInfo.provider?.cryptoFee;
    if (providerFee) {
      feeSum = feeSum.plus(
        providerFee.amount.multipliedBy(providerFeeToken || providerFee.token.price)
      );
    }

    return this.to.price.multipliedBy(this.to.tokenAmount).minus(feeSum);
  }

  public authWallet(): Promise<string> {
    throw new RubicSdkError('Method not implemented.');
  }
}
