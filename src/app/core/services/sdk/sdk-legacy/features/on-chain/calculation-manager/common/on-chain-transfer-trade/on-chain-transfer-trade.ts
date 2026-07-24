import {
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  SwapRequestInterface,
  Token
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
import { TransferSwapRequestInterface } from '../../../../ws-api/chains/transfer-trade/models/transfer-swap-request-interface';
import { SwapResponseInterface } from '../../../../ws-api/models/swap-response-interface';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { BasicSendTransactionOptions, RubicSdkError, TradeExpiredError } from '@cryptorubic/web3';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { OnChainTrade } from '../on-chain-trade/on-chain-trade';
import { OnChainTransferConfig } from './models/on-chain-transfer-config';

export abstract class OnChainTransferTrade extends OnChainTrade<OnChainTransferConfig> {
  protected lastTransactionConfig: OnChainTransferConfig | null = null;

  protected paymentInfo: CrossChainTransferData | null = null;

  public readonly from: PriceTokenAmount;

  public readonly to: PriceTokenAmount;

  public readonly feeInfo: FeeInfo;

  public readonly path: RubicStep[];

  public readonly slippageTolerance: number;

  protected readonly spenderAddress = '';

  protected actualTokenAmount: BigNumber;

  protected readonly apiQuote: QuoteRequestInterface;

  protected readonly apiResponse: QuoteResponseInterface;

  protected readonly transferRubicApiService: RubicApiService;

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
    this.transferRubicApiService = rubicApiService;
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

  public async swap(_options?: SwapTransactionOptions): Promise<string | never> {
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
    const res = await this.getPaymentInfo(receiverAddress || '', testMode, '', refundAddress);

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

  protected override async fetchSwapData<Data>(
    body: SwapRequestInterface | TransferSwapRequestInterface
  ): Promise<SwapResponseInterface<Data>> {
    try {
      const res = await this.transferRubicApiService.fetchSwapData<Data>(body);
      this.lastSwapResponse = res as RubicAny;
      return res;
    } catch (err) {
      if (err instanceof TradeExpiredError) {
        return this.refetchTransferTrade<Data>(body);
      }

      throw err;
    }
  }

  private refetchTransferTrade<Data>(
    body: SwapRequestInterface | TransferSwapRequestInterface
  ): Promise<SwapResponseInterface<Data>> {
    const res = this.transferRubicApiService.fetchBestSwapData<Data>({
      ...body,
      preferredProvider: this.type
    });
    this.lastSwapResponse = res as RubicAny;
    return res;
  }
}
