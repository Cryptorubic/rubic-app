import {
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  SwapRequestInterface,
  TronBlockchainName
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { EncodeTransactionOptions } from '../../../../../common/models/encode-transaction-options';
import { SwapTransactionOptions } from '../../../../../common/models/swap-transaction-options';
import { OnChainTrade } from '../on-chain-trade';
import { TronEncodedConfigAndToAmount } from '../../../models/aggregator-on-chain-types';
import {
  FailedToCheckForTransactionReceiptError,
  parseError,
  TronAdapter,
  TronTransactionConfig,
  TronTransactionOptions,
  UnnecessaryApproveError
} from '@cryptorubic/web3';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';

export abstract class TronOnChainTrade extends OnChainTrade {
  protected lastTransactionConfig: TronTransactionConfig | null = null;

  public abstract override readonly from: PriceTokenAmount<TronBlockchainName>;

  public abstract override readonly to: PriceTokenAmount<TronBlockchainName>;

  protected override get chainAdapter(): TronAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(this.from.blockchain);
  }

  private readonly apiQuote: QuoteRequestInterface;

  private readonly apiResponse: QuoteResponseInterface;

  constructor(
    integratorAddress: string,
    apiQuote: QuoteRequestInterface,
    apiResponse: QuoteResponseInterface,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService
  ) {
    super(integratorAddress, sdkLegacyService, rubicApiService);
    this.apiQuote = apiQuote || null;
    this.apiResponse = apiResponse || null;
  }

  public async approve(
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
      this.spenderAddress,
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

  public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
    await this.checkWalletState(options?.testMode);
    await this.checkAllowanceAndApprove(options);

    const { onConfirm } = options;
    let transactionHash: string;
    const onTransactionHash = (hash: string) => {
      if (onConfirm) {
        onConfirm(hash);
      }
      transactionHash = hash;
    };

    const fromAddress = this.walletAddress;
    const transactionData = await this.encode({
      ...options,
      fromAddress
    });
    const method = options?.testMode ? 'sendTransaction' : 'trySendTransaction';

    try {
      await this.chainAdapter.signer[method]({
        txOptions: {
          onTransactionHash,
          ...(transactionData?.feeLimit && { feeLimit: transactionData.feeLimit }),
          ...(transactionData.callValue && {
            callValue: new BigNumber(transactionData.callValue).toNumber()
          }),
          ...(transactionData.rawParameter && {
            rawParameter: transactionData.rawParameter
          })
        },
        contractAddress: transactionData.to,
        methodSignature: transactionData.signature,
        parameters: transactionData.arguments
      });

      return transactionHash!;
    } catch (err) {
      if (err instanceof FailedToCheckForTransactionReceiptError) {
        return transactionHash!;
      }

      throw parseError(err);
    }
  }

  public async encode(options: EncodeTransactionOptions): Promise<TronTransactionConfig> {
    await this.checkFromAddress(options.fromAddress, true);
    await this.checkReceiverAddress(options.receiverAddress);

    return this.setTransactionConfig(options);
  }

  protected async setTransactionConfig(
    options: EncodeTransactionOptions
  ): Promise<TronTransactionConfig> {
    if (this.lastTransactionConfig && options.useCacheData) {
      return this.lastTransactionConfig;
    }

    const { tx, toAmount } = await this.getTransactionConfigAndAmount(options.receiverAddress);

    this._lastTo = this.to.clone({ weiAmount: new BigNumber(toAmount) });
    this.lastTransactionConfig = tx;

    setTimeout(() => {
      this.lastTransactionConfig = null;
    }, 15_000);

    if (!options.skipAmountCheck) {
      this.checkAmountChange(toAmount, this.to.stringWeiAmount);
    }
    return tx;
  }

  protected async getTransactionConfigAndAmount(
    receiverAddress?: string
  ): Promise<TronEncodedConfigAndToAmount> {
    if (!this.apiResponse || !this.apiQuote) {
      throw new Error('Failed to load api response');
    }
    const swapRequestData: SwapRequestInterface = {
      ...this.apiQuote,
      fromAddress: this.walletAddress,
      receiver: receiverAddress || this.walletAddress,
      id: this.apiResponse.id
    };
    const { transaction, estimate } = await this.fetchSwapData<TronTransactionConfig>(
      swapRequestData
    );
    const amount = estimate.destinationWeiAmount;

    return { tx: transaction, toAmount: amount };
  }

  public async encodeApprove(
    tokenAddress: string,
    spenderAddress: string,
    stringWeiAmount: string
  ): Promise<TronTransactionConfig> {
    return this.chainAdapter.encodeApprove(tokenAddress, spenderAddress, stringWeiAmount);
  }
}
