import {
  BlockchainsInfo,
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  SwapPrivateRequestInterface
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { EncodeTransactionOptions } from '../../../../common/models/encode-transaction-options';
import { SwapTransactionOptions } from '../../../../common/models/swap-transaction-options';
import {
  CrossChainPaymentInfo,
  CrossChainTransferData
} from '../../../../cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-payment-info';
import { FeeInfo } from '../../../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from '../../../../cross-chain/calculation-manager/providers/common/models/rubicStep';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import {
  BasicSendTransactionOptions,
  FailedToCheckForTransactionReceiptError,
  RubicSdkError
} from '@cryptorubic/web3';
import { OnChainTrade } from '../on-chain-trade/on-chain-trade';
import { OnChainTransferConfig } from './models/on-chain-transfer-config';
import { TransactionInterface } from 'node_modules/@cryptorubic/core/src/lib/models/api/transaction.interface';
import { parseExtraFields } from '../../../../ws-api/chains/transfer-trade/utils/parse-extra-fields';

export abstract class OnChainTransferTrade extends OnChainTrade<OnChainTransferConfig> {
  protected lastTransactionConfig: OnChainTransferConfig | null = null;

  protected _paymentInfo: CrossChainTransferData | null = null;

  public get paymentInfo(): CrossChainTransferData | null {
    return this._paymentInfo;
  }

  public readonly from: PriceTokenAmount;

  public readonly to: PriceTokenAmount;

  public readonly feeInfo: FeeInfo;

  public readonly path: RubicStep[];

  public readonly slippageTolerance: number;

  protected readonly spenderAddress = '';

  protected actualTokenAmount: BigNumber;

  protected readonly apiQuote: QuoteRequestInterface;

  protected readonly apiResponse: QuoteResponseInterface;

  constructor(
    from: PriceTokenAmount,
    to: PriceTokenAmount,
    feeInfo: FeeInfo,
    path: RubicStep[],
    slippageTolerance: number,
    apiQuote: QuoteRequestInterface,
    apiResponse: QuoteResponseInterface,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService
  ) {
    super(apiResponse, sdkLegacyService, rubicApiService);
    this.from = from;
    this.to = to;
    this.feeInfo = feeInfo;
    this.path = path;
    this.slippageTolerance = slippageTolerance;
    this.apiQuote = apiQuote;
    this.apiResponse = apiResponse;
    this.actualTokenAmount = to.tokenAmount;
  }

  public override async needApprove(_fromAddress?: string): Promise<boolean> {
    return false;
  }

  public async approve(
    _options: BasicSendTransactionOptions,
    _checkNeedApprove: boolean,
    _weiAmount: BigNumber
  ): Promise<unknown> {
    throw new RubicSdkError("For deposit trades use 'getTransferTrade' method");
  }

  public async encode(_options: EncodeTransactionOptions): Promise<unknown> {
    throw new RubicSdkError("For deposit trades use 'getTransferTrade' method");
  }

  public async getTransferTrade(
    receiverAddress: string,
    refundAddress?: string,
    skipAmountChangeCheck?: boolean
  ): Promise<CrossChainPaymentInfo> {
    await this.setTransactionConfig(
      skipAmountChangeCheck || false,
      false,
      false,
      receiverAddress,
      refundAddress
    );
    if (!this.paymentInfo) {
      throw new Error('Deposit address is not set');
    }
    const extraField = this.paymentInfo.depositExtraIdName
      ? {
          name: this.paymentInfo.depositExtraIdName,
          value: this.paymentInfo.depositExtraId
        }
      : null;

    return {
      id: this.paymentInfo.id,
      depositAddress: this.paymentInfo.depositAddress,
      toAmount: this.actualTokenAmount,
      ...(extraField && { extraField })
    };
  }

  protected async getTransactionConfigAndAmount(
    testMode?: boolean,
    receiverAddress?: string,
    refundAddress?: string
  ): Promise<{ config: OnChainTransferConfig; amount: string }> {
    const swapRequestData: SwapPrivateRequestInterface = {
      ...this.apiQuote,
      id: this.apiResponse.id,
      receiver: receiverAddress || '',
      refundAddress: refundAddress || '',
      enableChecks: !testMode
    };

    const res =
      await this.rubicApiService.fetchSwapPrivateTrade<TransactionInterface>(swapRequestData);

    const amount = res.estimate.destinationTokenAmount;
    this.actualTokenAmount = new BigNumber(amount);

    const extraFields = parseExtraFields(res.transaction);

    this._paymentInfo = {
      depositAddress: res.transaction.depositAddress,
      id: res.transaction.exchangeId,
      toAmount: res.estimate.destinationTokenAmount,
      ...(extraFields && {
        depositExtraId: extraFields.value,
        depositExtraIdName: extraFields.name
      })
    };

    return {
      config: res as OnChainTransferConfig,
      amount: res.estimate.destinationWeiAmount
    };
  }

  public swap(options: SwapTransactionOptions = {}): Promise<string | never> {
    return this.swapDirect(options);
  }

  private async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
    if (!BlockchainsInfo.isEvmBlockchainName(this.from.blockchain)) {
      throw new RubicSdkError("For non-evm chains use 'getTransferTrade' method");
    }

    await this.checkWalletState(options?.testMode);
    await this.checkReceiverAddress(
      options.receiverAddress,
      !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain),
      this.type
    );

    const { onConfirm, gasPriceOptions } = options;
    let transactionHash: string;
    const onTransactionHash = (hash: string) => {
      if (onConfirm) onConfirm(hash);
      transactionHash = hash;
    };

    try {
      await this.setTransactionConfig(
        false,
        options.useCacheData || false,
        options.testMode || false,
        options.receiverAddress,
        options.refundAddress
      );
      if (!this.paymentInfo) {
        throw new Error('Deposit address is not set');
      }

      const evmAdapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(
        this.from.blockchain
      );
      if (this.from.isNative) {
        await evmAdapter.signer.trySendTransaction({
          txOptions: {
            to: this.paymentInfo.depositAddress,
            value: this.from.weiAmount,
            onTransactionHash,
            gasPriceOptions
          }
        });
      } else {
        await evmAdapter.signer.trySendTransaction({
          txOptions: {
            to: this.from.address,
            data: this.lastSwapResponse.transaction.data,
            value: '0',
            onTransactionHash,
            gasPriceOptions
          }
        });
        // await evmAdapter.signer.tryExecuteContractMethod(
        //   this.from.address,
        //   erc20TokenAbi,
        //   'transfer',
        //   [this.paymentInfo.depositAddress, this.from.stringWeiAmount],
        //   {
        //     onTransactionHash,
        //     gasPriceOptions
        //   }
        // );
      }

      return transactionHash!;
    } catch (err) {
      if (err instanceof FailedToCheckForTransactionReceiptError) {
        return transactionHash!;
      }
      throw err;
    }
  }

  protected async setTransactionConfig(
    skipAmountChangeCheck: boolean,
    useCacheData: boolean,
    testMode?: boolean,
    receiverAddress?: string,
    refundAddress?: string
  ): Promise<OnChainTransferConfig> {
    if (this.lastTransactionConfig && useCacheData) {
      return this.lastTransactionConfig;
    }

    const { config, amount } = await this.getTransactionConfigAndAmount(
      testMode,
      receiverAddress,
      refundAddress
    );
    this.lastTransactionConfig = config;
    setTimeout(() => {
      this.lastTransactionConfig = null;
    }, 15_000);

    if (!skipAmountChangeCheck) {
      this.checkAmountChange(amount, this.to.stringWeiAmount);
    }
    return config;
  }

  public clone(): OnChainTrade {
    return { ...this };
  }
}
