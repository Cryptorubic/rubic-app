import { PriceTokenAmount, RippleBlockchainName, SwapRequestInterface } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { SwapTransactionOptions } from '../../../../../common/models/swap-transaction-options';
import { CrossChainTrade } from '../cross-chain-trade';
import {
  EvmBasicTransactionOptions,
  FailedToCheckForTransactionReceiptError,
  parseError,
  RippleAdapter,
  RubicSdkError,
  TooLowAmountError,
  UserRejectError
} from '@cryptorubic/web3';
import {
  parseRippleTransactionConfig,
  RippleRawTransactionConfig,
  RippleTransactionConfig
} from '@app/core/services/sdk/sdk-legacy/features/on-chain/calculation-manager/common/on-chain-trade/ripple-on-chain-trade/models/ripple-transaction-config';

export abstract class RippleCrossChainTrade extends CrossChainTrade<RippleTransactionConfig> {
  public abstract override readonly from: PriceTokenAmount<RippleBlockchainName>;

  protected get chainAdapter(): RippleAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(this.from.blockchain);
  }

  public get estimatedGas(): BigNumber | null {
    return null;
  }

  public override async approve(
    _options: EvmBasicTransactionOptions,
    _checkNeedApprove: boolean,
    _amount: BigNumber
  ): Promise<string> {
    throw new Error('Method is not supported');
  }

  protected async checkAllowanceAndApprove(): Promise<void> {}

  public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
    this.checkWalletConnected();
    let transactionHash: string;

    try {
      const txConfig = await this.setTransactionConfig(
        false,
        options?.useCacheData || false,
        options.testMode,
        options?.receiverAddress
      );

      const { onConfirm } = options;
      const onTransactionHash = (hash: string) => {
        if (onConfirm) {
          onConfirm(hash);
        }
        transactionHash = hash;
      };

      await this.chainAdapter.signer.sendTransaction({
        txOptions: { ...txConfig, onTransactionHash }
      });

      return transactionHash!;
    } catch (err) {
      if (err.message?.includes('User rejected the request') || err.code === 4001) {
        throw new UserRejectError();
      }
      if (err?.error?.errorId === 'ERROR_LOW_GIVE_AMOUNT') {
        throw new TooLowAmountError();
      }
      if (err instanceof FailedToCheckForTransactionReceiptError) {
        return transactionHash!;
      }

      throw parseError(err);
    }
  }

  public async encode(): Promise<unknown> {
    throw new Error('Method is not supported');
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

  protected async getTransactionConfigAndAmount(
    testMode?: boolean,
    receiverAddress?: string
  ): Promise<{
    config: RippleTransactionConfig;
    amount: string;
  }> {
    const swapRequestData: SwapRequestInterface = {
      ...this.apiQuote,
      fromAddress: this.walletAddress,
      receiver: receiverAddress,
      id: this.apiResponse.id,
      enableChecks: !testMode
    };

    const swapData = await this.fetchSwapData<RippleRawTransactionConfig>(swapRequestData);

    this._uniqueInfo = swapData.uniqueInfo ?? {};
    const amount = swapData.estimate.destinationWeiAmount;

    return { config: parseRippleTransactionConfig(swapData.transaction), amount };
  }

  public authWallet(): Promise<string> {
    throw new RubicSdkError('Method not implemented.');
  }
}
