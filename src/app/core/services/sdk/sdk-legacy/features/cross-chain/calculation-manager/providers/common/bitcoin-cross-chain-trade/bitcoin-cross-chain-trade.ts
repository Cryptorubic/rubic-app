import {
  BitcoinBlockchainName,
  BLOCKCHAIN_NAME,
  PriceTokenAmount,
  SwapRequestInterface
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { SwapTransactionOptions } from '../../../../../common/models/swap-transaction-options';
import { CrossChainTrade } from '../cross-chain-trade';
import { BitcoinTransferTxApiResp } from './models/bitcoin-trade-types';
import {
  BitcoinAdapter,
  BitcoinPsbtEncodedConfig,
  BitcoinTransferEncodedConfig,
  EvmBasicTransactionOptions,
  FailedToCheckForTransactionReceiptError,
  parseError,
  RubicSdkError,
  TooLowAmountError,
  UserRejectError
} from '@cryptorubic/web3';

export abstract class BitcoinCrossChainTrade extends CrossChainTrade<
  BitcoinTransferEncodedConfig | BitcoinPsbtEncodedConfig
> {
  public abstract override readonly from: PriceTokenAmount<BitcoinBlockchainName>;

  public abstract readonly memo: string;

  protected get chainAdapter(): BitcoinAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(this.from.blockchain);
  }

  protected abstract needProvidePubKey: boolean;

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
    config: BitcoinTransferEncodedConfig | BitcoinPsbtEncodedConfig;
    amount: string;
  }> {
    let publicKey: string | null = null;
    if (this.needProvidePubKey) {
      const btcAdapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(
        BLOCKCHAIN_NAME.BITCOIN
      );
      publicKey = await btcAdapter.getPublicKey(this.walletAddress);
    }

    const swapRequestData: SwapRequestInterface = {
      ...this.apiQuote,
      fromAddress: this.walletAddress,
      receiver: receiverAddress,
      id: this.apiResponse.id,
      enableChecks: !testMode,
      privacyRefCode: this.privacyRefCode,
      ...(publicKey && { publicKey })
    };

    const swapData = await this.fetchSwapData<BitcoinTransferTxApiResp | BitcoinPsbtEncodedConfig>(
      swapRequestData
    );

    this._uniqueInfo = swapData.uniqueInfo ?? {};
    const amount = swapData.estimate.destinationWeiAmount;

    const config = this.isPsbtConfig(swapData.transaction)
      ? (swapData.transaction as BitcoinPsbtEncodedConfig)
      : ({
          depositAddress: swapData.transaction.depositAddress,
          value: swapData.transaction.value,
          memo: swapData.transaction.extraFields?.memo
        } as BitcoinTransferEncodedConfig);

    return { config, amount };
  }

  private isPsbtConfig(
    txConfig: BitcoinTransferTxApiResp | BitcoinTransferEncodedConfig | BitcoinPsbtEncodedConfig
  ): txConfig is BitcoinPsbtEncodedConfig {
    return 'psbt' in txConfig;
  }

  public authWallet(): Promise<string> {
    throw new RubicSdkError('Method not implemented.');
  }
}
