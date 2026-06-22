import {
  BlockchainsInfo,
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  SuiBlockchainName,
  SwapRequestInterface
} from '@cryptorubic/core';
import { Transaction } from '@mysten/sui/transactions';
import BigNumber from 'bignumber.js';
import { EncodeTransactionOptions } from '../../../../../common/models/encode-transaction-options';
import { SwapTransactionOptions } from '../../../../../common/models/swap-transaction-options';
import { CrossChainTrade } from '../cross-chain-trade';
import { RubicStep } from '../models/rubicStep';
import { SuiTransactionConfig } from '../../../../../common/models/sui-web3-pure/sui-encode-config';
import {
  EvmBasicTransactionOptions,
  FailedToCheckForTransactionReceiptError,
  parseError,
  RubicSdkError,
  SuiAdapter
} from '@cryptorubic/web3';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';

export abstract class SuiCrossChainTrade extends CrossChainTrade<SuiTransactionConfig> {
  public abstract override readonly from: PriceTokenAmount<SuiBlockchainName>;

  protected override get chainAdapter(): SuiAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(this.from.blockchain);
  }

  /**
   * Gets gas fee in source blockchain.
   */
  public get estimatedGas(): BigNumber | null {
    return null;
  }

  constructor(
    providerAddress: string,
    routePath: RubicStep[],
    apiQuote: QuoteRequestInterface,
    apiResponse: QuoteResponseInterface,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService
  ) {
    super(providerAddress, routePath, apiQuote, apiResponse, sdkLegacyService, rubicApiService);
  }

  public override async approve(
    _options: EvmBasicTransactionOptions,
    _checkNeedApprove: boolean,
    _amount: BigNumber
  ): Promise<string> {
    throw new Error('Method is not supported');
  }

  /**
   * @returns txHash (srcTxHash) | never
   */
  public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
    this.checkWalletConnected();
    let transactionHash: string;

    try {
      const transactionConfig = await this.setTransactionConfig(
        false,
        options?.useCacheData || false,
        options?.testMode,
        options?.receiverAddress
      );

      const { onConfirm } = options;

      const onTransactionHash = (hash: string) => {
        if (onConfirm) {
          onConfirm(hash);
        }
        transactionHash = hash;
      };

      const tx = transactionConfig.transaction;
      await this.chainAdapter.signer.sendTransaction({
        txOptions: {
          // @ts-ignore
          transactionBlock: Transaction.from(tx),
          onTransactionHash
        }
      });

      return transactionHash!;
    } catch (err) {
      if (err instanceof FailedToCheckForTransactionReceiptError) {
        return transactionHash!;
      }
      throw parseError(err);
    }
  }

  public async encode(options: EncodeTransactionOptions): Promise<SuiTransactionConfig> {
    await this.checkFromAddress(options.fromAddress, true);
    await this.checkReceiverAddress(
      options.receiverAddress,
      !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
    );

    return this.setTransactionConfig(
      options?.skipAmountCheck || false,
      options?.useCacheData || false,
      options?.testMode,
      options?.receiverAddress || this.walletAddress
    );
  }

  protected async getTransactionConfigAndAmount(
    testMode?: boolean,
    receiverAddress?: string
  ): Promise<{ config: SuiTransactionConfig; amount: string }> {
    const swapRequestParams: SwapRequestInterface = {
      ...this.apiQuote,
      fromAddress: this.walletAddress,
      receiver: receiverAddress,
      id: this.apiResponse.id,
      enableChecks: !testMode
    };

    const { transaction, estimate } = await this.fetchSwapData<SuiTransactionConfig>(
      swapRequestParams
    );

    const config: SuiTransactionConfig = {
      transaction: transaction.transaction!
    };

    const amount = estimate.destinationWeiAmount;

    return { config, amount };
  }

  public authWallet(): Promise<string> {
    throw new RubicSdkError('Method not implemented.');
  }
}
