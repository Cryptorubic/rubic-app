import {
  BlockchainsInfo,
  ErrorInterface,
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  SolanaBlockchainName,
  SwapRequestInterface
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { EncodeTransactionOptions } from '../../../../../common/models/encode-transaction-options';
import { SwapTransactionOptions } from '../../../../../common/models/swap-transaction-options';
import { CrossChainTrade } from '../cross-chain-trade';
import { RubicStep } from '../models/rubicStep';
import {
  EvmBasicTransactionOptions,
  EvmTransactionConfig,
  FailedToCheckForTransactionReceiptError,
  parseError,
  RubicSdkError,
  SolanaAdapter,
  TooLowAmountError
} from '@cryptorubic/web3';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';

export abstract class SolanaCrossChainTrade extends CrossChainTrade<{
  data: string;
  warnings?: ErrorInterface[];
}> {
  public abstract override readonly from: PriceTokenAmount<SolanaBlockchainName>;

  protected get chainAdapter(): SolanaAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(this.from.blockchain);
  }

  /**
   * Gets gas fee in source blockchain.
   */
  public get estimatedGas(): BigNumber | null {
    return null;
  }

  private readonly shouldCalculateConsumedParams: boolean;

  constructor(
    providerAddress: string,
    routePath: RubicStep[],
    apiQuote: QuoteRequestInterface,
    apiResponse: QuoteResponseInterface,
    shouldCalculateConsumedParams: boolean,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService
  ) {
    super(providerAddress, routePath, apiQuote, apiResponse, sdkLegacyService, rubicApiService);
    this.shouldCalculateConsumedParams = shouldCalculateConsumedParams;
  }

  public override async approve(
    _options: EvmBasicTransactionOptions,
    _checkNeedApprove: boolean,
    _amount: BigNumber
  ): Promise<string> {
    throw new Error('Method is not supported');
  }

  protected async checkAllowanceAndApprove(
    options?: Omit<SwapTransactionOptions, 'onConfirm' | 'gasLimit'>
  ): Promise<void> {
    const needApprove = await this.needApprove();
    if (!needApprove) {
      return;
    }

    const approveOptions: EvmBasicTransactionOptions = {
      onTransactionHash: options?.onApprove,
      gas: options?.approveGasLimit,
      gasPriceOptions: options?.gasPriceOptions
    };

    await this.approve(approveOptions, false, this.from.weiAmount);
  }

  /**
   *
   * @returns txHash(srcTxHash) | never
   */
  public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
    this.checkWalletConnected();
    await this.checkAllowanceAndApprove(options);
    let transactionHash: string;

    try {
      const { data, warnings } = await this.setTransactionConfig(
        false,
        options?.useCacheData || false,
        options.testMode,
        options?.receiverAddress
      );

      const { onConfirm, onWarning } = options;

      if (onWarning && warnings?.length) {
        onWarning(warnings);
        if (warnings.find(warning => String(warning.code).startsWith('5'))) {
          delete options.solanaSponsorParams;
        }
      }

      const onTransactionHash = (hash: string) => {
        if (onConfirm) {
          onConfirm(hash);
        }
        transactionHash = hash;
      };

      await this.chainAdapter.signer.sendTransaction({
        txOptions: { data, onTransactionHash, sponsorParams: options?.solanaSponsorParams },
        calculateConsumedParams: this.shouldCalculateConsumedParams
      });

      return transactionHash!;
    } catch (err) {
      if (err?.error?.errorId === 'ERROR_LOW_GIVE_AMOUNT') {
        throw new TooLowAmountError();
      }
      if (err instanceof FailedToCheckForTransactionReceiptError) {
        return transactionHash!;
      }
      throw parseError(err);
    }
  }

  public async encode(options: EncodeTransactionOptions): Promise<Partial<EvmTransactionConfig>> {
    await this.checkFromAddress(options.fromAddress, true);
    await this.checkReceiverAddress(
      options.receiverAddress,
      !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
    );

    return this.setTransactionConfig(
      options?.skipAmountCheck || false,
      options?.useCacheData || false,
      options.testMode,
      options?.receiverAddress || this.walletAddress
    );
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
  ): Promise<{ config: EvmTransactionConfig; amount: string }> {
    const swapRequestParams: SwapRequestInterface = {
      ...this.apiQuote,
      fromAddress: this.walletAddress,
      receiver: receiverAddress,
      id: this.apiResponse.id,
      enableChecks: !testMode,
      // @ts-ignore
      sponsorGas: true,
      // @ts-ignore
      makeLogs: true
    };

    const { transaction, estimate, warnings } = await this.fetchSwapData<EvmTransactionConfig>(
      swapRequestParams
    );

    const toAmount = estimate.destinationWeiAmount;

    return { config: { ...transaction, warnings }, amount: toAmount };
  }

  public authWallet(): Promise<string> {
    throw new RubicSdkError('Method not implemented.');
  }
}
