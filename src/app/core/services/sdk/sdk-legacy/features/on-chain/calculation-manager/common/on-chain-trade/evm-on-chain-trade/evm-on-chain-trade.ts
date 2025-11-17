import {
  BLOCKCHAIN_NAME,
  blockchainId,
  BlockchainsInfo,
  EvmBlockchainName,
  nativeTokensList,
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  SwapRequestInterface,
  Token
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { EncodeTransactionOptions } from '../../../../../common/models/encode-transaction-options';
import { SwapTransactionOptions } from '../../../../../common/models/swap-transaction-options';
import { rubicProxyContractAddress } from '../../../../../cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { evmCommonCrossChainAbi } from '../../../../../cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/evm-common-cross-chain-abi';
import { gatewayRubicCrossChainAbi } from '../../../../../cross-chain/calculation-manager/providers/common/evm-cross-chain-trade/constants/gateway-rubic-cross-chain-abi';
import { FeeInfo } from '../../../../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { GetContractParamsOptions } from '../../../../../cross-chain/calculation-manager/providers/common/models/get-contract-params-options';
import { RubicStep } from '../../../../../cross-chain/calculation-manager/providers/common/models/rubicStep';
import { IsDeflationToken } from '../../../../../common/models/is-deflation-token';
import { EvmOnChainTradeStruct } from './models/evm-on-chain-trade-struct';
import { GasFeeInfo } from './models/gas-fee-info';
import { OptionsGasParams, TransactionGasParams } from './models/gas-params';
import { OnChainTrade } from '../on-chain-trade';
import { EvmEncodedConfigAndToAmount } from '../../../models/aggregator-on-chain-types';

import { Permit2ApproveConfig } from './models/permit2-approve-config';
import { Abi, stringToHex } from 'viem';
import {
  ContractParams,
  EvmAdapter,
  EvmBasicTransactionOptions,
  EvmTransactionConfig,
  EvmTransactionOptions,
  FailedToCheckForTransactionReceiptError,
  getViemGasOptions,
  LowSlippageDeflationaryTokenError,
  NotWhitelistedProviderError,
  parseError,
  SwapRequestError,
  UnnecessaryApproveError
} from '@cryptorubic/web3';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { ProxyCrossChainEvmTrade } from '../../../../../cross-chain/calculation-manager/providers/common/proxy-cross-chain-evm-facade/proxy-cross-chain-evm-trade';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';

export abstract class EvmOnChainTrade extends OnChainTrade {
  protected lastTransactionConfig: EvmTransactionConfig | null = null;

  public readonly from: PriceTokenAmount<EvmBlockchainName>;

  public readonly to: PriceTokenAmount<EvmBlockchainName>;

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
  protected readonly fromWithoutFee: PriceTokenAmount<EvmBlockchainName>;

  protected readonly withDeflation: {
    from: IsDeflationToken;
    to: IsDeflationToken;
  };

  public abstract readonly dexContractAddress: string; // not static because https://github.com/microsoft/TypeScript/issues/34516

  private readonly usedForCrossChain: boolean;

  /**
   * Filled if approve goes through permit2 contract
   */
  public readonly permit2ApproveConfig: Permit2ApproveConfig = {
    usePermit2Approve: false,
    permit2Address: null
  };

  protected override get chainAdapter(): EvmAdapter {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(this.from.blockchain);
  }

  protected get spenderAddress(): string {
    return this.useProxy || this.usedForCrossChain
      ? rubicProxyContractAddress[this.from.blockchain].gateway
      : this.dexContractAddress;
  }

  private readonly apiQuote: QuoteRequestInterface | null = null;

  private readonly apiResponse: QuoteResponseInterface | null = null;

  protected constructor(
    evmOnChainTradeStruct: EvmOnChainTradeStruct,
    sdkLegacyService: SdkLegacyService,
    rubicApiService: RubicApiService
  ) {
    super(evmOnChainTradeStruct.apiQuote!.integratorAddress!, sdkLegacyService, rubicApiService);

    this.from = evmOnChainTradeStruct.from;
    this.to = evmOnChainTradeStruct.to;

    this.slippageTolerance = evmOnChainTradeStruct.slippageTolerance;
    this.path = evmOnChainTradeStruct.path;

    this.gasFeeInfo = evmOnChainTradeStruct.gasFeeInfo;

    this.useProxy = evmOnChainTradeStruct.useProxy;
    this.fromWithoutFee = evmOnChainTradeStruct.fromWithoutFee;
    this.usedForCrossChain = evmOnChainTradeStruct.usedForCrossChain || false;

    this.apiQuote = evmOnChainTradeStruct?.apiQuote || null;
    this.apiResponse = evmOnChainTradeStruct?.apiResponse || null;

    if (evmOnChainTradeStruct.permit2ApproveAddress) {
      this.permit2ApproveConfig = {
        usePermit2Approve: true,
        permit2Address: evmOnChainTradeStruct.permit2ApproveAddress
      };
    }

    this.feeInfo = {
      rubicProxy: {
        ...(evmOnChainTradeStruct.proxyFeeInfo?.fixedFeeToken && {
          fixedFee: {
            amount:
              evmOnChainTradeStruct.proxyFeeInfo?.fixedFeeToken.tokenAmount || new BigNumber(0),
            token: evmOnChainTradeStruct.proxyFeeInfo?.fixedFeeToken
          }
        }),
        ...(evmOnChainTradeStruct.proxyFeeInfo?.platformFee && {
          platformFee: {
            percent: evmOnChainTradeStruct.proxyFeeInfo?.platformFee.percent || 0,
            token: evmOnChainTradeStruct.proxyFeeInfo?.platformFee.token
          }
        })
      }
    };
    this.withDeflation = evmOnChainTradeStruct.withDeflation;
  }

  public async approve(
    options: EvmBasicTransactionOptions,
    checkNeedApprove: boolean,
    weiAmount: BigNumber
  ): Promise<string> {
    if (checkNeedApprove) {
      const needApprove = await this.needApprove();
      if (!needApprove) {
        throw new UnnecessaryApproveError();
      }
    }

    this.checkWalletConnected();
    await this.checkBlockchainCorrect();

    const approveAmount =
      this.from.blockchain === BLOCKCHAIN_NAME.GNOSIS ||
      this.from.blockchain === BLOCKCHAIN_NAME.CRONOS
        ? this.from.weiAmount
        : weiAmount;

    const fromTokenAddress =
      this.from.isNative && this.from.blockchain === BLOCKCHAIN_NAME.METIS
        ? '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'
        : this.from.address;

    return this.chainAdapter.approveTokens(
      fromTokenAddress,
      this.spenderAddress,
      approveAmount,
      options
    );
  }

  public async encodeApprove(
    tokenAddress: string,
    spenderAddress: string,
    stringWeiAmount: string
  ): Promise<EvmTransactionConfig> {
    return this.chainAdapter.encodeApprove(tokenAddress, spenderAddress, stringWeiAmount);
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
      gas: options?.approveGasLimit || undefined,
      gasPriceOptions: options?.gasPriceOptions || undefined
    };

    await this.approve(approveOptions, false, this.from.weiAmount);
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
    await this.checkAllowanceAndApprove(options);

    const { onConfirm } = options;
    let transactionHash: string;
    const onTransactionHash = (hash: string) => {
      if (onConfirm) {
        onConfirm(hash);
      }
      transactionHash = hash;
    };

    const fromAddress = this.walletAddress;
    const { data, value, to } = await this.encode({ ...options, fromAddress });
    const method = options?.testMode ? 'sendTransaction' : 'trySendTransaction';

    try {
      await this.chainAdapter.signer[method]({
        txOptions: {
          data,
          to,
          value,
          onTransactionHash,
          gasPriceOptions: options.gasPriceOptions,
          ...(options?.useEip155 && {
            chainId: `0x${blockchainId[this.from.blockchain].toString(16)}`
          })
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

  public async getData(
    fromAddress: string,
    options: SwapTransactionOptions = {}
  ): Promise<EvmTransactionOptions | never> {
    this.apiFromAddress = fromAddress;
    if (!options?.testMode) {
      await this.checkWalletState(options.testMode);
    }
    await this.checkReceiverAddress(
      options.receiverAddress,
      !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
    );

    const { data, value, to } = await this.encode({ ...options, fromAddress });

    try {
      if (!options?.testMode) {
        const gasLimit = await this.chainAdapter.simulateTransaction(
          {
            to,
            data,
            value
          },
          fromAddress
        );

        const gasfulViemParams = {
          account: fromAddress,
          data,
          to,
          value,
          ...getViemGasOptions(options),
          gas: gasLimit
        };

        return gasfulViemParams;
      }

      return { data, value, to };
    } catch (err) {
      throw err;
    }
  }

  public async encode(options: EncodeTransactionOptions): Promise<EvmTransactionConfig> {
    await this.checkFromAddress(options.fromAddress, true);
    await this.checkReceiverAddress(options.receiverAddress);

    return this.setTransactionConfig(options);
  }

  /**
   * Encodes trade to swap it through on-chain proxy.
   */
  protected async encodeProxy(options: EncodeTransactionOptions): Promise<EvmTransactionConfig> {
    const { contractAddress, contractAbi, methodName, methodArguments, value } =
      await this.getProxyContractParams(options);

    return EvmAdapter.encodeMethodCall(
      contractAddress,
      contractAbi as Abi,
      methodName,
      methodArguments,
      value
    );
  }

  private async getProxyContractParams(options: EncodeTransactionOptions): Promise<ContractParams> {
    const swapData = await this.getSwapData(options);

    const receiverAddress = options.receiverAddress || options.fromAddress;
    const methodArguments = [
      EvmAdapter.randomHex(32),
      this.providerAddress,
      EvmOnChainTrade.getReferrerAddress(options.referrer),
      receiverAddress,
      this.toTokenAmountMin.stringWeiAmount,
      swapData
    ];

    const nativeToken = nativeTokensList[this.from.blockchain];
    const proxyFee = new BigNumber(this.feeInfo.rubicProxy?.fixedFee?.amount || '0');
    const value = Token.toWei(
      proxyFee.plus(this.from.isNative ? this.from.tokenAmount : '0'),
      nativeToken.decimals
    );

    const txConfig = EvmAdapter.encodeMethodCall(
      rubicProxyContractAddress[this.from.blockchain].router,
      evmCommonCrossChainAbi,
      'swapTokensGeneric',
      methodArguments,
      value
    );

    const sendingToken = this.from.isNative ? [] : [this.from.address];
    const sendingAmount = this.from.isNative ? [] : [this.from.stringWeiAmount];

    return {
      contractAddress: rubicProxyContractAddress[this.from.blockchain].gateway,
      contractAbi: gatewayRubicCrossChainAbi,
      methodName: 'startViaRubic',
      methodArguments: [sendingToken, sendingAmount, txConfig.data],
      value
    };
  }

  private static getReferrerAddress(referrer: string | undefined): string {
    if (referrer) {
      return '0x' + stringToHex(referrer).slice(2, 42).padStart(40, '0');
    }

    return '0x0000000000000000000000000000000000000000';
  }

  /**
   * Encodes trade to swap it directly through dex contract.
   * @param options Encode options.
   */
  public async encodeDirect(options: EncodeTransactionOptions): Promise<EvmTransactionConfig> {
    await this.checkFromAddress(options.fromAddress, true);
    await this.checkReceiverAddress(options.receiverAddress);

    try {
      const transactionData = await this.setTransactionConfig(options);

      const { gas, gasPrice } = this.getGasParams(options, {
        gasLimit: transactionData.gas,
        gasPrice: transactionData.gasPrice
      });

      return {
        to: transactionData.to,
        data: transactionData.data,
        value: this.fromWithoutFee.isNative ? this.fromWithoutFee.stringWeiAmount : '0',
        gas,
        gasPrice
      };
    } catch (err: any) {
      throw this.getSwapError(err);
    }
  }

  protected isDeflationError(): boolean {
    return (
      (this.withDeflation.from.isDeflation || this.withDeflation.to.isDeflation) &&
      this.slippageTolerance < 0.12
    );
  }

  protected getGasParams(
    options: OptionsGasParams,
    calculatedGasFee: OptionsGasParams = {
      gasLimit: this.gasFeeInfo?.gasLimit?.toFixed(),
      gasPrice: this.gasFeeInfo?.gasPrice?.toFixed()
    }
  ): TransactionGasParams {
    return {
      gas: options.gasLimit || calculatedGasFee.gasLimit,
      gasPrice: options.gasPrice || calculatedGasFee.gasPrice,
      maxPriorityFeePerGas: options.maxPriorityFeePerGas || calculatedGasFee.maxPriorityFeePerGas,
      maxFeePerGas: options.maxFeePerGas || calculatedGasFee.maxFeePerGas
    };
  }

  protected async getSwapData(options: GetContractParamsOptions): Promise<unknown[]> {
    const directTransactionConfig = await this.encodeDirect({
      ...options,
      fromAddress: rubicProxyContractAddress[this.from.blockchain].router,
      supportFee: false,
      receiverAddress: rubicProxyContractAddress[this.from.blockchain].router
    });
    const availableDexs = (
      await ProxyCrossChainEvmTrade.getWhitelistedDexes(this.from.blockchain, this.sdkLegacyService)
    ).map(address => address.toLowerCase());

    const routerAddress = directTransactionConfig.to;
    const method = directTransactionConfig.data.slice(0, 10);

    if (!availableDexs.includes(routerAddress.toLowerCase())) {
      throw new NotWhitelistedProviderError(routerAddress, undefined, 'dex');
    }
    await ProxyCrossChainEvmTrade.checkDexWhiteList(
      this.from.blockchain,
      routerAddress,
      method,
      this.sdkLegacyService
    );

    return [
      [
        routerAddress,
        routerAddress,
        this.from.address,
        this.to.address,
        this.from.stringWeiAmount,
        directTransactionConfig.data,
        true
      ]
    ];
  }

  protected async getTransactionConfigAndAmount(
    options?: EncodeTransactionOptions
  ): Promise<EvmEncodedConfigAndToAmount> {
    if (!this.apiResponse || !this.apiQuote) {
      throw new Error('Failed to load api response');
    }
    const swapRequestData: SwapRequestInterface = {
      ...this.apiQuote,
      fromAddress: this.walletAddress,
      receiver: options?.receiverAddress || this.walletAddress,
      id: this.apiResponse.id
    };
    const swapData = await this.fetchSwapData<EvmTransactionConfig>(swapRequestData);

    const config = {
      data: swapData.transaction.data!,
      value: swapData.transaction.value!,
      to: swapData.transaction.to!
    };

    const amount = swapData.estimate.destinationWeiAmount;

    return { tx: config, toAmount: amount };
  }

  protected async setTransactionConfig(
    options: EncodeTransactionOptions
  ): Promise<EvmTransactionConfig> {
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

  protected getSwapError(err: Error & { code: number }): Error {
    if ([400, 500, 503].includes(err.code)) {
      throw new SwapRequestError();
    }
    if (this.isDeflationError()) {
      throw new LowSlippageDeflationaryTokenError();
    }
    throw parseError(err);
  }
}
