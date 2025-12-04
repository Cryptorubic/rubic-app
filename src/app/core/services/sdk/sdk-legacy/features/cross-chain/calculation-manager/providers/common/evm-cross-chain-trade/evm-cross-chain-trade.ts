import {
  BLOCKCHAIN_NAME,
  blockchainId,
  BlockchainsInfo,
  EvmBlockchainName,
  PriceTokenAmount,
  SwapRequestInterface,
  Token
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { EncodeTransactionOptions } from '../../../../../common/models/encode-transaction-options';
import { SwapTransactionOptions } from '../../../../../common/models/swap-transaction-options';
import { CrossChainTrade } from '../cross-chain-trade';
import { GasData } from './models/gas-data';

import { transferTradeSupportedProviders } from '../cross-chain-transfer-trade/constans/transfer-trade-supported-providers';
import {
  EvmAdapter,
  EvmBasicTransactionOptions,
  EvmTransactionConfig,
  FailedToCheckForTransactionReceiptError,
  RubicSdkError,
  UnnecessaryApproveError
} from '@cryptorubic/web3';

export abstract class EvmCrossChainTrade extends CrossChainTrade<EvmTransactionConfig> {
  public abstract override readonly from: PriceTokenAmount<EvmBlockchainName>;

  /**
   * Gas fee info in source blockchain.
   */
  public abstract readonly gasData: GasData;

  protected override get chainAdapter(): EvmAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(this.from.blockchain);
  }

  /**
   * Signature to auth wallet
   */
  protected signature = '';

  protected get gasLimitRatio(): number {
    if (
      this.to.blockchain === BLOCKCHAIN_NAME.ZETACHAIN ||
      this.from.blockchain === BLOCKCHAIN_NAME.ZETACHAIN
    ) {
      return 1.5;
    }
    return 1.05;
  }

  /**
   * Gets gas fee in source blockchain.
   */
  public get estimatedGas(): BigNumber | null {
    if (!this.gasData) {
      return null;
    }

    if (this.gasData.baseFee && this.gasData.maxPriorityFeePerGas) {
      return Token.fromWei(this.gasData.baseFee).plus(
        Token.fromWei(this.gasData.maxPriorityFeePerGas)
      );
    }

    if (this.gasData.gasPrice) {
      return Token.fromWei(this.gasData.gasPrice).multipliedBy(this.gasData.gasLimit ?? 0);
    }

    return null;
  }

  /**
   * Returns true, if allowance is not enough.
   */
  public override async needApprove(): Promise<boolean> {
    this.checkWalletConnected();

    if (this.from.isNative && this.from.blockchain !== BLOCKCHAIN_NAME.METIS) {
      return false;
    }

    const isTransferTrade = transferTradeSupportedProviders.some(
      transferTradeType => transferTradeType === this.type
    );

    if ((!this.useProxy && isTransferTrade) || !this.contractSpender) return false;

    const fromTokenAddress =
      this.from.isNative && this.from.blockchain === BLOCKCHAIN_NAME.METIS
        ? '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'
        : this.from.address;

    const allowance = await this.chainAdapter.getAllowance(
      fromTokenAddress,
      this.walletAddress,
      this.contractSpender
    );
    return this.from.weiAmount.gt(allowance.allowanceWei);
  }

  public override async approve(
    options: EvmBasicTransactionOptions,
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

    const approveAmount =
      this.from.blockchain === BLOCKCHAIN_NAME.GNOSIS ||
      this.from.blockchain === BLOCKCHAIN_NAME.CRONOS
        ? this.from.weiAmount
        : weiAmount;

    const fromTokenAddress =
      this.from.isNative && this.from.blockchain === BLOCKCHAIN_NAME.METIS
        ? '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'
        : this.from.address;

    return this.chainAdapter.approveTokens(
      fromTokenAddress,
      this.contractSpender,
      approveAmount,
      options
    );
  }

  public async authWallet(): Promise<string> {
    if (this.needAuthWallet) {
      const res = await this.rubicApiService.getMessageToAuthWallet(this.walletAddress);

      const signature = await this.chainAdapter.signer.signMessage(res.messageToAuth);
      this.signature = signature;
      return signature;
    }

    throw new RubicSdkError('No need to auth wallet');
  }

  /**
   *
   * @returns txHash(srcTxHash) | never
   */
  public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
    if (!options?.testMode) {
      await this.checkTradeErrors();
    }
    await this.checkReceiverAddress(
      options.receiverAddress,
      !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
    );
    const method = options?.testMode ? 'sendTransaction' : 'trySendTransaction';

    const fromAddress = this.walletAddress;

    const { data, value, to, gas } = await this.encode({ ...options, fromAddress });

    const { onConfirm, gasPriceOptions } = options;
    let transactionHash: string;
    const onTransactionHash = (hash: string) => {
      if (onConfirm) {
        onConfirm(hash);
      }
      transactionHash = hash;
    };

    try {
      await this.chainAdapter.signer[method]({
        txOptions: {
          data,
          to,
          value,
          gas,
          onTransactionHash,
          gasLimitRatio: this.gasLimitRatio,
          gasPriceOptions,
          ...(options?.useEip155 && {
            chainId: `0x${blockchainId[this.from.blockchain].toString(16)}`
          })
        }
      });

      return transactionHash!;
    } catch (err) {
      if (err instanceof FailedToCheckForTransactionReceiptError) {
        return transactionHash!;
      }
      throw err;
    }
  }

  public async encode(options: EncodeTransactionOptions): Promise<EvmTransactionConfig> {
    await this.checkFromAddress(options.fromAddress, true);
    await this.checkReceiverAddress(
      options.receiverAddress,
      !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
    );

    return this.setTransactionConfig(
      options?.skipAmountCheck || false,
      options?.useCacheData || false,
      options.testMode || false,
      options?.receiverAddress || this.walletAddress,
      options?.refundAddress
    );
  }

  protected async getTransactionConfigAndAmount(
    testMode?: boolean,
    receiverAddress?: string
  ): Promise<{ config: EvmTransactionConfig; amount: string }> {
    const swapRequestData: SwapRequestInterface = {
      ...this.apiQuote,
      fromAddress: this.walletAddress,
      receiver: receiverAddress,
      id: this.apiResponse.id,
      enableChecks: !testMode,
      ...(this.signature && { signature: this.signature })
    };
    const swapData = await this.fetchSwapData<EvmTransactionConfig>(swapRequestData);

    this._uniqueInfo = swapData.uniqueInfo ?? {};
    const amount = swapData.estimate.destinationWeiAmount;

    const config = {
      data: swapData.transaction.data!,
      value: swapData.transaction.value!,
      to: swapData.transaction.to!,
      gas: swapData.fees.gasTokenFees.gas.gasLimit!
    };

    return { config, amount };
  }
}
