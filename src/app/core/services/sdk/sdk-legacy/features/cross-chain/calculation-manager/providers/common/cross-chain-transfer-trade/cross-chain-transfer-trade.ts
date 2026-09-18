import {
  BlockchainName,
  BlockchainsInfo,
  EvmBlockchainName,
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  SwapPrivateRequestInterface
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { SwapTransactionOptions } from '../../../../../common/models/swap-transaction-options';
import { EvmOnChainTrade } from '../../../../../on-chain/calculation-manager/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

import { GasData } from '../evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../models/fee-info';
import { RubicStep } from '../models/rubicStep';
import { CrossChainPaymentInfo, CrossChainTransferData } from './models/cross-chain-payment-info';
import { FailedToCheckForTransactionReceiptError, RubicSdkError } from '@cryptorubic/web3';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { CrossChainTrade } from '../cross-chain-trade';
import { CrossChainTransferConfig } from './models/cross-chain-transfer-config';
import { TransferSwapRequestInterface } from '../../../../../ws-api/chains/transfer-trade/models/transfer-swap-request-interface';
import { TransactionInterface } from 'node_modules/@cryptorubic/core/src/lib/models/api/transaction.interface';
import { parseExtraFields } from '../../../../../ws-api/chains/transfer-trade/utils/parse-extra-fields';
//
export abstract class CrossChainTransferTrade extends CrossChainTrade<CrossChainTransferConfig> {
  public swap(): Promise<string | never> {
    throw new Error('Method not implemented.');
  }

  public encode(): Promise<unknown> {
    throw new Error('Method not implemented.');
  }

  public authWallet(): Promise<string> {
    throw new Error('Method not implemented.');
  }

  protected _paymentInfo: CrossChainTransferData | null = null;

  public get paymentInfo(): CrossChainTransferData | null {
    return this._paymentInfo;
  }

  public readonly onChainTrade: EvmOnChainTrade | null;

  protected get methodName(): string {
    return this.onChainTrade
      ? 'swapAndStartBridgeTokensViaTransfer'
      : 'startBridgeTokensViaTransfer';
  }

  public readonly isAggregator = false;

  public readonly from: PriceTokenAmount<BlockchainName>;

  public readonly to: PriceTokenAmount<BlockchainName>;

  public readonly toTokenAmountMin: BigNumber;

  public readonly gasData: GasData;

  public readonly feeInfo: FeeInfo;

  public readonly priceImpact: number | null;

  protected actualTokenAmount: BigNumber;

  constructor(
    providerAddress: string,
    routePath: RubicStep[],
    onChainTrade: EvmOnChainTrade | null,
    from: PriceTokenAmount<BlockchainName>,
    to: PriceTokenAmount<BlockchainName>,
    toTokenAmountMin: BigNumber,
    gasData: GasData,
    feeInfo: FeeInfo,
    priceImpact: number | null,
    apiQuote: QuoteRequestInterface,
    apiResponse: QuoteResponseInterface,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService
  ) {
    super(providerAddress, routePath, apiQuote, apiResponse, sdkLegacyService, rubicApiService);
    this.onChainTrade = onChainTrade;
    this.from = from as PriceTokenAmount<EvmBlockchainName>;
    this.to = to;
    this.toTokenAmountMin = toTokenAmountMin;
    this.gasData = gasData;
    this.feeInfo = feeInfo;
    this.priceImpact = priceImpact;
    this.actualTokenAmount = to.tokenAmount;
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

  protected override async getTransactionConfigAndAmount(
    testMode?: boolean,
    receiverAddress?: string,
    refundAddress?: string
  ): Promise<{ config: CrossChainTransferConfig; amount: string }> {
    const isPrivateTrade = this.apiResponse.private;
    const isFromEvm = BlockchainsInfo.isEvmBlockchainName(this.from.blockchain);
    const fromAddress = isFromEvm ? this.walletAddress : '';
    receiverAddress = receiverAddress || this.walletAddress;
    refundAddress = isFromEvm ? refundAddress || this.walletAddress : refundAddress;

    const swapRequestData: TransferSwapRequestInterface = {
      ...this.apiQuote,
      receiver: receiverAddress,
      id: this.apiResponse.id,
      enableChecks: !testMode,
      ...(fromAddress && { fromAddress }),
      ...(refundAddress && { refundAddress })
    };

    const res = isPrivateTrade
      ? await this.rubicApiService.fetchSwapPrivateTrade<TransactionInterface>(
          swapRequestData as SwapPrivateRequestInterface
        )
      : await this.fetchSwapData<CrossChainTransferConfig>(swapRequestData);

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
      config: res as CrossChainTransferConfig,
      amount: res.estimate.destinationWeiAmount
    };
  }

  public async swapDirect(options: SwapTransactionOptions = {}): Promise<string | never> {
    if (!BlockchainsInfo.isEvmBlockchainName(this.from.blockchain)) {
      throw new RubicSdkError("For non-evm chains use 'getTransferTrade' method");
    }

    await this.checkTradeErrors();
    await this.checkReceiverAddress(
      options.receiverAddress,
      !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain),
      this.type
    );

    const { onConfirm, gasPriceOptions } = options;
    let transactionHash: string;
    const onTransactionHash = (hash: string) => {
      if (onConfirm) {
        onConfirm(hash);
      }
      transactionHash = hash;
    };

    try {
      await this.setTransactionConfig(
        false,
        options.useCacheData || false,
        options.testMode || false,
        options?.receiverAddress || this.walletAddress
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

  protected override async setTransactionConfig(
    skipAmountChangeCheck: boolean,
    useCacheData: boolean,
    testMode?: boolean,
    receiverAddress?: string,
    refundAddress?: string
  ): Promise<CrossChainTransferConfig> {
    if (this.lastTransactionConfig && useCacheData) {
      return this.lastTransactionConfig;
    }

    const { config, amount } = await this.getTransactionConfigAndAmount(
      testMode,
      receiverAddress || this.walletAddress,
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
}
