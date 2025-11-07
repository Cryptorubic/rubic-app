import {
  nativeTokensList,
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  SuiBlockchainName,
  SwapRequestInterface,
  Token
} from '@cryptorubic/core';
import { Transaction } from '@mysten/sui/transactions';
import BigNumber from 'bignumber.js';
import { EncodeTransactionOptions } from '../../../../../common/models/encode-transaction-options';
import { SwapTransactionOptions } from '../../../../../common/models/swap-transaction-options';
import { FeeInfo } from '../../../../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from '../../../../../cross-chain/calculation-manager/providers/common/models/rubicStep';
import { IsDeflationToken } from '../../../../../common/models/is-deflation-token';
import { GasFeeInfo } from '../evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../on-chain-trade';
import { SuiOnChainTradeStruct } from './sui-on-chain-trade-struct';
import { SuiEncodedConfigAndToAmount } from '../../../models/aggregator-on-chain-types';
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

export abstract class SuiOnChainTrade extends OnChainTrade {
  protected lastTransactionConfig: SuiTransactionConfig | null = null;

  public readonly from: PriceTokenAmount<SuiBlockchainName>;

  public readonly to: PriceTokenAmount<SuiBlockchainName>;

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
  protected readonly fromWithoutFee: PriceTokenAmount<SuiBlockchainName>;

  protected readonly withDeflation: {
    from: IsDeflationToken;
    to: IsDeflationToken;
  };

  protected get spenderAddress(): string {
    throw new RubicSdkError('No spender address!');
  }

  protected override get chainAdapter(): SuiAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(this.from.blockchain);
  }

  public abstract readonly dexContractAddress: string; // not static because https://github.com/microsoft/TypeScript/issues/34516

  private readonly apiQuote: QuoteRequestInterface | null = null;

  private readonly apiResponse: QuoteResponseInterface | null = null;

  protected constructor(
    tradeStruct: SuiOnChainTradeStruct,
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
    this.fromWithoutFee = tradeStruct.fromWithoutFee;

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

  public async encodeApprove(): Promise<unknown> {
    throw new Error('Method is not supported');
  }

  protected async checkAllowanceAndApprove(): Promise<void> {
    throw new Error('Method is not supported');
  }

  /**
   * Calculates value for swap transaction.
   * @param providerValue Value, returned from cross-chain provider.
   */
  protected getSwapValue(providerValue?: BigNumber | string | number | null): string {
    const nativeToken = nativeTokensList[this.from.blockchain];
    const fixedFeeValue = Token.toWei(
      this.feeInfo.rubicProxy?.fixedFee?.amount || 0,
      nativeToken.decimals
    );

    let fromValue: BigNumber;
    if (this.from.isNative) {
      if (providerValue) {
        fromValue = new BigNumber(providerValue).dividedBy(
          1 - (this.feeInfo.rubicProxy?.platformFee?.percent || 0) / 100
        );
      } else {
        fromValue = this.from.weiAmount;
      }
    } else {
      fromValue = new BigNumber(providerValue || 0);
    }

    return new BigNumber(fromValue).plus(fixedFeeValue).toFixed(0, 0);
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
      const tx = transactionConfig.transaction;
      await this.chainAdapter.client.sendTransaction({
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
    await this.checkReceiverAddress(options.receiverAddress);

    return this.setTransactionConfig(options);
  }

  protected async getTransactionConfigAndAmount(
    options?: EncodeTransactionOptions
  ): Promise<SuiEncodedConfigAndToAmount> {
    if (!this.apiResponse || !this.apiQuote) {
      throw new Error('Failed to load api response');
    }
    const swapRequestData: SwapRequestInterface = {
      ...this.apiQuote,
      fromAddress: this.walletAddress,
      receiver: options?.receiverAddress || this.walletAddress,
      id: this.apiResponse.id
    };
    const swapData = await this.fetchSwapData<SuiTransactionConfig>(swapRequestData);

    const config = {
      transaction: swapData.transaction.transaction!
    };

    const amount = swapData.estimate.destinationWeiAmount;

    return { tx: config, toAmount: amount };
  }

  protected async setTransactionConfig(
    options: EncodeTransactionOptions
  ): Promise<SuiTransactionConfig> {
    if (this.lastTransactionConfig && options.useCacheData) {
      return this.lastTransactionConfig;
    }

    const { tx, toAmount } = await this.getTransactionConfigAndAmount(options);

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
}
