import {
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  StellarBlockchainName,
  SwapRequestInterface
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { EncodeTransactionOptions } from '../../../../../common/models/encode-transaction-options';
import { SwapTransactionOptions } from '../../../../../common/models/swap-transaction-options';
import { FeeInfo } from '../../../../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from '../../../../../cross-chain/calculation-manager/providers/common/models/rubicStep';
import { IsDeflationToken } from '../../../../../common/models/is-deflation-token';
import { GasFeeInfo } from '../evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../on-chain-trade';
import {
  EvmBasicTransactionOptions,
  FailedToCheckForTransactionReceiptError,
  parseError,
  RubicSdkError
} from '@cryptorubic/web3';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { StellarOnChainTradeStruct } from './models/stellar-on-chain-trade-struct';
import { StellarTransactionConfig } from '@cryptorubic/web3/src/lib/utils/models/stellar-transaction-config';
import { StellarAdapter } from '@cryptorubic/web3/src/lib/adapter/adapters/adapter-stellar/stellar-adapter';

export abstract class StellarOnChainTrade extends OnChainTrade {
  protected lastTransactionConfig: StellarTransactionConfig | null = null;

  public readonly from: PriceTokenAmount<StellarBlockchainName>;

  public readonly to: PriceTokenAmount<StellarBlockchainName>;

  public readonly slippageTolerance: number;

  public readonly path: RubicStep[];

  /**
   * Gas fee info, including gas limit and gas price.
   */
  public readonly gasFeeInfo: GasFeeInfo | null;

  public readonly feeInfo: FeeInfo;

  /**
   * True, if trade must be swapped through on-chain proxy contract.
   */
  public readonly useProxy: boolean;

  /**
   * Contains from amount, from which proxy fees were subtracted.
   * If proxy is not used, then amount is equal to from amount.
   */
  protected readonly fromWithoutFee: PriceTokenAmount<StellarBlockchainName>;

  protected readonly withDeflation: {
    from: IsDeflationToken;
    to: IsDeflationToken;
  };

  protected get spenderAddress(): string {
    throw new RubicSdkError('No spender address!');
  }

  protected override get chainAdapter(): StellarAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(this.from.blockchain);
  }

  public abstract readonly dexContractAddress: string; // not static because https://github.com/microsoft/TypeScript/issues/34516

  private readonly apiQuote: QuoteRequestInterface | null = null;

  private readonly apiResponse: QuoteResponseInterface | null = null;

  protected constructor(
    tradeStruct: StellarOnChainTradeStruct,
    providerAddress: string,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService
  ) {
    super(providerAddress, sdkLegacyService, rubicApiService);

    this.from = tradeStruct.from;
    this.to = tradeStruct.to;

    this.slippageTolerance = tradeStruct.slippageTolerance;
    this.path = tradeStruct.path;

    this.gasFeeInfo = tradeStruct.gasFeeInfo;

    this.useProxy = tradeStruct.useProxy;
    this.fromWithoutFee = tradeStruct.from;

    this.apiQuote = tradeStruct?.apiQuote || null;
    this.apiResponse = tradeStruct?.apiResponse || null;

    this.feeInfo = {
      rubicProxy: {
        ...(tradeStruct.proxyFeeInfo?.fixedFeeToken && {
          fixedFee: {
            amount: tradeStruct.proxyFeeInfo?.fixedFeeToken.tokenAmount || new BigNumber(0),
            token: tradeStruct.proxyFeeInfo?.fixedFeeToken
          }
        }),
        ...(tradeStruct.proxyFeeInfo?.platformFee && {
          platformFee: {
            percent: tradeStruct.proxyFeeInfo?.platformFee.percent || 0,
            token: tradeStruct.proxyFeeInfo?.platformFee.token
          }
        })
      }
    };
    this.withDeflation = tradeStruct.withDeflation;
  }

  public async approve(
    _options: EvmBasicTransactionOptions,
    _checkNeedApprove: boolean,
    _amount: BigNumber
  ): Promise<unknown> {
    throw new Error('Method is not supported');
  }

  public async addTrustline(): Promise<string> {
    return this.chainAdapter.addTrustline(this.to.address);
  }

  public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
    await this.checkWalletState(options?.testMode);

    const { onConfirm } = options;
    let transactionHash: string;
    const onTransactionHash = (hash: string) => {
      if (onConfirm) {
        onConfirm(hash);
      }
      transactionHash = hash;
    };

    const fromAddress = this.walletAddress;
    const receiverAddress = options.receiverAddress || this.walletAddress;

    const transactionConfig = await this.encode({
      fromAddress,
      receiverAddress,
      ...options
    });

    try {
      await this.chainAdapter.signer.sendTransaction({
        txOptions: {
          transaction: transactionConfig.transaction,
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

  public async encode(options: EncodeTransactionOptions): Promise<StellarTransactionConfig> {
    await this.checkFromAddress(options.fromAddress, true);
    await this.checkReceiverAddress(options.receiverAddress);

    return this.setTransactionConfig(options);
  }

  protected async getTransactionConfigAndAmount(
    options?: EncodeTransactionOptions
  ): Promise<{ toAmount: string; config: StellarTransactionConfig }> {
    if (!this.apiResponse || !this.apiQuote) {
      throw new Error('Failed to load api response');
    }
    const swapRequestData: SwapRequestInterface = {
      ...this.apiQuote,
      fromAddress: this.walletAddress,
      receiver: options?.receiverAddress || this.walletAddress,
      id: this.apiResponse.id
    };
    const swapData = await this.fetchSwapData<StellarTransactionConfig>(swapRequestData);

    const amount = swapData.estimate.destinationWeiAmount;

    return { config: swapData.transaction, toAmount: amount };
  }

  protected async setTransactionConfig(
    options: EncodeTransactionOptions
  ): Promise<StellarTransactionConfig> {
    if (this.lastTransactionConfig && options.useCacheData) {
      return this.lastTransactionConfig;
    }

    const { config, toAmount } = await this.getTransactionConfigAndAmount(options);

    this._lastTo = this.to.clone({ weiAmount: new BigNumber(toAmount) });
    this.lastTransactionConfig = config;

    setTimeout(() => {
      this.lastTransactionConfig = null;
    }, 15_000);

    if (!options.skipAmountCheck) {
      this.checkAmountChange(toAmount, this.to.stringWeiAmount);
    }
    return config;
  }
}
