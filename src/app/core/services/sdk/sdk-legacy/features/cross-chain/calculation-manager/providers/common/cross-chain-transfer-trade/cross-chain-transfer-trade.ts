import {
  BlockchainName,
  BlockchainsInfo,
  EvmBlockchainName,
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  Token
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { SwapTransactionOptions } from '../../../../../common/models/swap-transaction-options';
import { EvmOnChainTrade } from '../../../../../on-chain/calculation-manager/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

import { GasData } from '../evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../models/fee-info';
import { RubicStep } from '../models/rubicStep';
import { CrossChainPaymentInfo, CrossChainTransferData } from './models/cross-chain-payment-info';
import {
  erc20TokenAbi,
  EvmAdapter,
  FailedToCheckForTransactionReceiptError,
  RubicSdkError
} from '@cryptorubic/web3';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { CrossChainTrade } from '../cross-chain-trade';
import { CrossChainTransferConfig } from './models/cross-chain-transfer-config';

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

  protected paymentInfo: CrossChainTransferData | null = null;

  public readonly onChainTrade: EvmOnChainTrade | null;

  protected get methodName(): string {
    return this.onChainTrade
      ? 'swapAndStartBridgeTokensViaTransfer'
      : 'startBridgeTokensViaTransfer';
  }

  public readonly isAggregator = false;

  public readonly from: PriceTokenAmount<EvmBlockchainName>;

  public readonly to: PriceTokenAmount<BlockchainName>;

  public readonly toTokenAmountMin: BigNumber;

  public readonly gasData: GasData;

  public readonly feeInfo: FeeInfo;

  public readonly priceImpact: number | null;

  protected actualTokenAmount: BigNumber;

  protected get chainAdapter(): EvmAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(this.from.blockchain);
  }

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
    refundAddress?: string
  ): Promise<CrossChainPaymentInfo> {
    await this.setTransactionConfig(false, false, false, receiverAddress, refundAddress);
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
    const isFromEvm = BlockchainsInfo.isEvmBlockchainName(this.from.blockchain);

    const res = await this.getPaymentInfo(
      receiverAddress || this.walletAddress,
      testMode,
      isFromEvm ? this.walletAddress : '',
      isFromEvm ? refundAddress || this.walletAddress : refundAddress
    );

    const toAmountWei = Token.toWei(res.toAmount, this.to.decimals);
    this.paymentInfo = res;

    return {
      config: {
        amountToSend: res.toAmount,
        depositAddress: res.depositAddress,
        exchangeId: res.id,
        ...(res.depositExtraId &&
          res.depositExtraIdName && {
            extraFields: {
              name: res.depositExtraIdName,
              value: res.depositExtraId
            }
          })
      },
      amount: toAmountWei
    };
  }

  protected abstract getPaymentInfo(
    receiverAddress: string,
    testMode?: boolean,
    fromAddress?: string,
    refundAddress?: string
  ): Promise<CrossChainTransferData>;

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

      if (this.from.isNative) {
        await this.chainAdapter.signer.trySendTransaction({
          txOptions: {
            to: this.paymentInfo.depositAddress,
            value: this.from.weiAmount,
            onTransactionHash,
            gasPriceOptions
          }
        });
      } else {
        await this.chainAdapter.signer.tryExecuteContractMethod(
          this.from.address,
          erc20TokenAbi,
          'transfer',
          [this.paymentInfo.depositAddress, this.from.stringWeiAmount],
          {
            onTransactionHash,
            gasPriceOptions
          }
        );
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
