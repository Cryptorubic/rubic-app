import {
  BlockchainName,
  BlockchainsInfo,
  CHAIN_TYPE,
  EvmBlockchainName,
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  Token
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { ContractParams } from '../../../../../common/models/contract-params';
import { EncodeTransactionOptions } from '../../../../../common/models/encode-transaction-options';
import { SwapTransactionOptions } from '../../../../../common/models/swap-transaction-options';
import { EvmOnChainTrade } from '../../../../../on-chain/calculation-manager/common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';

import { rubicProxyContractAddress } from '../constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from '../evm-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { EvmCrossChainTrade } from '../evm-cross-chain-trade/evm-cross-chain-trade';
import { GasData } from '../evm-cross-chain-trade/models/gas-data';
import { FeeInfo } from '../models/fee-info';
import { GetContractParamsOptions } from '../models/get-contract-params-options';
import { RubicStep } from '../models/rubicStep';
import { ProxyCrossChainEvmTrade } from '../proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { CrossChainPaymentInfo, CrossChainTransferData } from './models/cross-chain-payment-info';
import {
  erc20TokenAbi,
  EvmAdapter,
  EvmTransactionConfig,
  FailedToCheckForTransactionReceiptError,
  RubicSdkError,
  Web3Pure
} from '@cryptorubic/web3';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { Abi } from 'viem';
import { MarkRequired } from '../../../models/cross-chain-manager-options';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';

export abstract class CrossChainTransferTrade extends EvmCrossChainTrade {
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
  ): Promise<{ config: EvmTransactionConfig; amount: string }> {
    const isFromEvm = BlockchainsInfo.isEvmBlockchainName(this.from.blockchain);

    const res = await this.getPaymentInfo(
      receiverAddress || this.walletAddress,
      testMode,
      isFromEvm ? this.walletAddress : '',
      isFromEvm ? refundAddress || this.walletAddress : refundAddress
    );

    const toAmountWei = Token.toWei(res.toAmount, this.to.decimals);
    this.paymentInfo = res;

    const config: EvmTransactionConfig = { to: '', data: '', value: '' };

    if (this.from.isNative) {
      config.value = this.from.stringWeiAmount;
      config.data = '0x';
      config.to = this.paymentInfo.depositAddress;
    } else {
      const blockchainType = BlockchainsInfo.getChainType(this.from.blockchain);

      if (blockchainType === CHAIN_TYPE.EVM) {
        const encodedConfig = EvmAdapter.encodeMethodCall(
          this.from.address,
          erc20TokenAbi,
          'transfer',
          [this.paymentInfo.depositAddress, this.from.stringWeiAmount],
          '0'
        );
        config.value = '0';
        config.to = this.from.address;
        config.data = encodedConfig.data;
      } else {
        config.value = '0';
        config.data = '0x';
        config.to = this.paymentInfo.depositAddress;
      }
    }

    return { config, amount: toAmountWei };
  }

  protected abstract getPaymentInfo(
    receiverAddress: string,
    testMode?: boolean,
    fromAddress?: string,
    refundAddress?: string
  ): Promise<CrossChainTransferData>;

  public override async encode(options: EncodeTransactionOptions): Promise<EvmTransactionConfig> {
    if (!BlockchainsInfo.isEvmBlockchainName(this.from.blockchain)) {
      throw new RubicSdkError('Cannot encode trade for non-evm blockchain');
    }

    await this.checkFromAddress(options.fromAddress, true, this.type);
    await this.checkReceiverAddress(
      options.receiverAddress,
      !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain),
      this.type
    );

    if (this.useProxy) {
      const { contractAddress, contractAbi, methodName, methodArguments, value } =
        await this.getContractParams({
          fromAddress: options.fromAddress,
          receiverAddress: options.receiverAddress || options.fromAddress
        });

      return EvmAdapter.encodeMethodCall(
        contractAddress,
        contractAbi as Abi,
        methodName,
        methodArguments,
        value
      );
    }
    return this.setTransactionConfig(
      options?.skipAmountCheck || false,
      options?.useCacheData || false,
      options.testMode,
      options?.receiverAddress || this.walletAddress
    );
  }

  protected async getContractParams(
    options: MarkRequired<GetContractParamsOptions, 'receiverAddress'>,
    skipAmountChangeCheck?: boolean
  ): Promise<ContractParams> {
    await this.setTransactionConfig(
      skipAmountChangeCheck || false,
      options.useCacheData || false,
      options.testMode,
      options.receiverAddress
    );
    if (!this.paymentInfo) {
      throw new Error('Deposit address is not set');
    }

    const toToken = this.to.clone({
      address: Web3Pure.getInstance(this.to.blockchain).emptyAddress
    });

    const bridgeData = ProxyCrossChainEvmTrade.getBridgeData(
      {
        ...options,
        receiverAddress: this.walletAddress
      },
      {
        walletAddress: this.walletAddress,
        fromTokenAmount: this.from,
        toTokenAmount: toToken,
        srcChainTrade: this.onChainTrade,
        providerAddress: this.providerAddress,
        type: `native:${this.bridgeType}`,
        fromAddress: this.walletAddress
      }
    );

    const providerData = [this.paymentInfo.depositAddress];

    const swapData =
      this.onChainTrade &&
      (await ProxyCrossChainEvmTrade.getSwapData(
        options,
        {
          walletAddress: this.walletAddress,
          contractAddress: rubicProxyContractAddress[this.from.blockchain].router,
          fromTokenAmount: this.from,
          toTokenAmount: this.onChainTrade.to,
          onChainEncodeFn: this.onChainTrade.encode.bind(this.onChainTrade)
        },
        this.sdkLegacyService
      ));

    const methodArguments = swapData
      ? [bridgeData, swapData, providerData]
      : [bridgeData, providerData];

    const value = this.getSwapValue();

    const transactionConfiguration = EvmAdapter.encodeMethodCall(
      rubicProxyContractAddress[this.from.blockchain].router,
      evmCommonCrossChainAbi,
      this.methodName,
      methodArguments,
      value
    );
    const sendingToken = this.from.isNative ? [] : [this.from.address];
    const sendingAmount = this.from.isNative ? [] : [this.from.stringWeiAmount];

    return {
      contractAddress: rubicProxyContractAddress[this.from.blockchain].gateway,
      contractAbi: gatewayRubicCrossChainAbi,
      methodName: 'startViaRubic',
      methodArguments: [sendingToken, sendingAmount, transactionConfiguration.data],
      value
    };
  }

  public encodeApprove(): Promise<Partial<EvmTransactionConfig>> {
    throw new RubicSdkError(`Cannot encode approve for ${this.type}`);
  }

  public override async needApprove(): Promise<boolean> {
    if (this.useProxy) {
      return super.needApprove();
    }
    return false;
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
  ): Promise<EvmTransactionConfig> {
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
