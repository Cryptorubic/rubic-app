import {
  BLOCKCHAIN_NAME,
  compareAddresses,
  PriceTokenAmount,
  StellarBlockchainName,
  SwapRequestInterface,
  Token
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { SwapTransactionOptions } from '../../../../../common/models/swap-transaction-options';
import { CrossChainTrade } from '../cross-chain-trade';
import {
  EvmBasicTransactionOptions,
  FailedToCheckForTransactionReceiptError,
  parseError,
  RubicSdkError,
  TooLowAmountError,
  UserRejectError
} from '@cryptorubic/web3';
import { StellarTransactionConfig } from '@cryptorubic/web3/src/lib/utils/models/stellar-transaction-config';
import { StellarAdapter } from '@cryptorubic/web3/src/lib/adapter/adapters/adapter-stellar/stellar-adapter';

export abstract class StellarCrossChainTrade extends CrossChainTrade<StellarTransactionConfig> {
  public abstract override readonly from: PriceTokenAmount<StellarBlockchainName>;

  public abstract trustlineTransitTokenAddress: string | null;

  protected get chainAdapter(): StellarAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(this.from.blockchain);
  }

  /**
   * Gets gas fee in source blockchain.
   */
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

  /**
   *
   * @returns txHash(srcTxHash) | never
   */
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
    throw new Error("Method is not supported');");
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
    config: StellarTransactionConfig;
    amount: string;
  }> {
    const swapRequestData: SwapRequestInterface = {
      ...this.apiQuote,
      fromAddress: this.walletAddress,
      receiver: receiverAddress,
      id: this.apiResponse.id,
      privacyRefCode: this.privacyRefCode,
      enableChecks: !testMode
    };

    const swapData = await this.fetchSwapData<StellarTransactionConfig>(swapRequestData);

    this._uniqueInfo = swapData.uniqueInfo ?? {};
    const amount = swapData.estimate.destinationWeiAmount;

    return { config: swapData.transaction, amount };
  }

  public authWallet(): Promise<string> {
    throw new RubicSdkError('Method not implemented.');
  }

  public getTrustlineTransitToken(): Token | null {
    if (
      !this.trustlineTransitTokenAddress ||
      compareAddresses(this.trustlineTransitTokenAddress, this.from.address)
    ) {
      return null;
    }

    const transitToken = this.routePath.map(route => {
      const token = route.path.find(
        routeToken =>
          compareAddresses(routeToken.address, this.trustlineTransitTokenAddress) &&
          routeToken.blockchain === BLOCKCHAIN_NAME.STELLAR
      );

      return token ?? null;
    })[0];

    return transitToken;
  }
}
