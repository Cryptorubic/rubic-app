import { PriceTokenAmount, SwapRequestInterface, TronBlockchainName } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { EncodeTransactionOptions } from '../../../../../common/models/encode-transaction-options';
import { SwapTransactionOptions } from '../../../../../common/models/swap-transaction-options';
import { CrossChainTrade } from '../cross-chain-trade';
import {
  FailedToCheckForTransactionReceiptError,
  RubicSdkError,
  TronAdapter,
  TronTransactionConfig,
  TronTransactionOptions,
  UnnecessaryApproveError
} from '@cryptorubic/web3';
import { MarkRequired } from '../../../models/utility-types';

export abstract class TronCrossChainTrade extends CrossChainTrade<TronTransactionConfig> {
  public abstract override readonly from: PriceTokenAmount<TronBlockchainName>;

  protected get chainAdapter(): TronAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(this.from.blockchain);
  }

  /**
   * Returns true, if allowance is not enough.
   */
  public override async needApprove(): Promise<boolean> {
    this.checkWalletConnected();

    if (this.from.isNative) {
      return false;
    }

    const allowance = await this.chainAdapter.getAllowance(
      this.from.address,
      this.walletAddress,
      this.contractSpender
    );

    return this.from.weiAmount.gt(allowance.allowanceWei);
  }

  public override async approve(
    options: TronTransactionOptions,
    checkNeedApprove: boolean,
    weiAmount: BigNumber
  ): Promise<string> {
    if (checkNeedApprove) {
      const needApprove = await this.needApprove();
      if (!needApprove) {
        throw new UnnecessaryApproveError();
      }
    }

    this.checkWalletConnected();
    await this.checkBlockchainCorrect();

    return this.chainAdapter.approveTokens(
      this.from.address,
      this.contractSpender,
      weiAmount,
      options
    );
  }

  protected async checkAllowanceAndApprove(
    options?: Omit<SwapTransactionOptions, 'onConfirm' | 'feeLimit'>
  ): Promise<void> {
    const needApprove = await this.needApprove();
    if (!needApprove) {
      return;
    }

    const approveOptions: TronTransactionOptions = {
      onTransactionHash: options?.onApprove,
      feeLimit: options?.approveFeeLimit
    };
    await this.approve(approveOptions, false, this.from.weiAmount);
  }

  public async swap(
    options: MarkRequired<SwapTransactionOptions, 'receiverAddress'>
  ): Promise<string | never> {
    if (!options?.testMode) {
      await this.checkTradeErrors();
    }
    await this.checkReceiverAddress(options.receiverAddress, true);
    const method = options?.testMode ? 'sendTransaction' : 'trySendTransaction';

    const { onConfirm } = options;
    let transactionHash: string;
    const onTransactionHash = (hash: string) => {
      if (onConfirm) {
        onConfirm(hash);
      }
      transactionHash = hash;
    };

    const fromAddress = this.walletAddress;
    const transactionConfig = await this.encode({ ...options, fromAddress });

    try {
      await this.chainAdapter.signer[method]({
        txOptions: {
          onTransactionHash,
          ...(transactionConfig?.feeLimit && { feeLimit: transactionConfig.feeLimit }),
          ...(transactionConfig.callValue && {
            callValue: new BigNumber(transactionConfig.callValue).toNumber()
          }),
          ...(transactionConfig.rawParameter && {
            rawParameter: transactionConfig.rawParameter
          })
        },
        contractAddress: transactionConfig.to,
        methodSignature: transactionConfig.signature,
        parameters: transactionConfig.arguments
      });

      return transactionHash!;
    } catch (err) {
      if (err instanceof FailedToCheckForTransactionReceiptError) {
        return transactionHash!;
      }
      throw err;
    }
  }

  public async encode(
    options: MarkRequired<EncodeTransactionOptions, 'receiverAddress'>
  ): Promise<TronTransactionConfig> {
    await this.checkFromAddress(options.fromAddress, true);
    await this.checkReceiverAddress(options.receiverAddress, true);

    return this.setTransactionConfig(
      options?.skipAmountCheck || false,
      options?.useCacheData || false,
      options.testMode,
      options?.receiverAddress || this.walletAddress
    );
  }

  public async encodeApprove(
    tokenAddress: string,
    spenderAddress: string,
    value: BigNumber
  ): Promise<TronTransactionConfig> {
    return this.chainAdapter.encodeApprove(tokenAddress, spenderAddress, value.toFixed(0));
  }

  public override getUsdPrice(): BigNumber {
    let feeSum = new BigNumber(0);
    const providerFee = this.feeInfo.provider?.cryptoFee;
    if (providerFee) {
      feeSum = feeSum.plus(providerFee.amount.multipliedBy(providerFee.token.price));
    }

    return this.to.price.multipliedBy(this.to.tokenAmount).minus(feeSum);
  }

  protected async getTransactionConfigAndAmount(
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

    const swapData = await this.fetchSwapData<TronTransactionConfig>(swapRequestParams);

    const toAmount = swapData.estimate.destinationWeiAmount;

    return { config: swapData.transaction, amount: toAmount };
  }

  public authWallet(): Promise<string> {
    throw new RubicSdkError('Method not implemented.');
  }
}
