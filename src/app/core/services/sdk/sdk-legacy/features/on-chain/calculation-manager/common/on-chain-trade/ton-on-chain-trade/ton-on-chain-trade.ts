import {
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  SwapRequestInterface,
  TonBlockchainName
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { EncodeTransactionOptions } from '../../../../../common/models/encode-transaction-options';
import { SwapTransactionOptions } from '../../../../../common/models/swap-transaction-options';
import { FeeInfo } from '../../../../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from '../../../../../cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TonTransactionConfig } from '../../../../../cross-chain/calculation-manager/providers/common/models/ton-transaction-config';
import { TradeInfo } from '../../../../../cross-chain/calculation-manager/providers/common/models/trade-info';

import { GasFeeInfo } from '../evm-on-chain-trade/models/gas-fee-info';
import { OnChainTrade } from '../on-chain-trade';
import { TonOnChainTradeStruct, TonTradeAdditionalInfo } from './models/ton-on-chian-trade-types';
import {
  FailedToCheckForTransactionReceiptError,
  RubicSdkError,
  TonAdapter
} from '@cryptorubic/web3';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';

export abstract class TonOnChainTrade extends OnChainTrade {
  public readonly from: PriceTokenAmount<TonBlockchainName>;

  public readonly to: PriceTokenAmount<TonBlockchainName>;

  public readonly slippageTolerance: number;

  public readonly feeInfo: FeeInfo = {};

  public readonly gasFeeInfo: GasFeeInfo | null;

  public readonly path: RubicStep[] = [];

  private readonly routingPath: RubicStep[];

  protected skipAmountCheck = false;

  public readonly additionalInfo: TonTradeAdditionalInfo;

  private readonly apiQuote: QuoteRequestInterface | null = null;

  private readonly apiResponse: QuoteResponseInterface | null = null;

  protected get spenderAddress(): string {
    throw new RubicSdkError('No spender address!');
  }

  protected override get chainAdapter(): TonAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(this.from.blockchain);
  }

  constructor(
    tradeStruct: TonOnChainTradeStruct,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService
  ) {
    super(tradeStruct.apiResponse, sdkLegacyService, rubicApiService);
    this.from = tradeStruct.from;
    this.to = tradeStruct.to;
    this.slippageTolerance = tradeStruct.slippageTolerance;
    this.gasFeeInfo = tradeStruct.gasFeeInfo;
    this.routingPath = tradeStruct.routingPath;
    this.additionalInfo = {
      isMultistep: this.routingPath.length > 1,
      isChangedSlippage: tradeStruct.isChangedSlippage
    };

    this.apiQuote = tradeStruct?.apiQuote || null;
    this.apiResponse = tradeStruct?.apiResponse || null;
  }

  public override async needApprove(): Promise<boolean> {
    return false;
  }

  public async approve(): Promise<void> {
    throw new RubicSdkError('Method not implemented!');
  }

  public async encode(options: EncodeTransactionOptions): Promise<TonTransactionConfig> {
    await this.checkFromAddress(options.fromAddress, true);
    await this.checkReceiverAddress(options.receiverAddress);

    return this.setTransactionConfig(options);
  }

  public async swap(options: SwapTransactionOptions): Promise<string | never> {
    await this.checkWalletState(options?.testMode);

    const fromAddress = this.walletAddress;
    const transactionConfig = await this.encode({ ...options, fromAddress });

    const { onConfirm } = options;
    let transactionHash: string;
    const onTransactionHash = (hash: string) => {
      if (onConfirm) {
        onConfirm(hash);
      }
      transactionHash = hash;
    };

    try {
      await this.chainAdapter.signer.sendTransaction({
        txOptions: {
          messages: transactionConfig.tonMessages,
          onTransactionHash
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

  protected async setTransactionConfig(
    options: EncodeTransactionOptions
  ): Promise<TonTransactionConfig> {
    const { config, amount } = await this.getTransactionConfigAndAmount(options.receiverAddress);
    this._lastTo = this.to.clone({ weiAmount: new BigNumber(amount) });

    if (!options.skipAmountCheck) {
      this.checkAmountChange(amount, this.to.stringWeiAmount);
    }
    return config;
  }

  protected async getTransactionConfigAndAmount(
    receiverAddress?: string
  ): Promise<{ config: TonTransactionConfig; amount: string }> {
    if (!this.apiResponse || !this.apiQuote) {
      throw new Error('Failed to load api response');
    }

    const swapRequestParams: SwapRequestInterface = {
      ...this.apiQuote,
      fromAddress: this.walletAddress,
      receiver: receiverAddress || this.walletAddress,
      privacyRefCode: this.privacyRefCode,
      id: this.apiResponse.id
    };

    const swapData = await this.fetchSwapData<TonTransactionConfig>(swapRequestParams);

    const toAmount = swapData.estimate.destinationWeiAmount;

    return { config: swapData.transaction, amount: toAmount };
  }

  public override getTradeInfo(): TradeInfo {
    return {
      estimatedGas: null,
      feeInfo: this.feeInfo,
      priceImpact: this.priceImpact ?? null,
      slippage: this.slippageTolerance * 100,
      routePath: this.routingPath
    };
  }
}
