import {
  BLOCKCHAIN_NAME,
  blockchainId,
  EvmBlockchainName,
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  SwapRequestInterface
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { EncodeTransactionOptions } from '../../../../../common/models/encode-transaction-options';
import { SwapTransactionOptions } from '../../../../../common/models/swap-transaction-options';
import { rubicProxyContractAddress } from '../../../../../cross-chain/calculation-manager/providers/common/constants/rubic-proxy-contract-address';
import { FeeInfo } from '../../../../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from '../../../../../cross-chain/calculation-manager/providers/common/models/rubicStep';
import { IsDeflationToken } from '../../../../../common/models/is-deflation-token';
import { EvmOnChainTradeStruct } from './models/evm-on-chain-trade-struct';
import { GasFeeInfo } from './models/gas-fee-info';
import { OnChainTrade } from '../on-chain-trade';
import { EvmEncodedConfigAndToAmount } from '../../../models/aggregator-on-chain-types';

import { Permit2ApproveConfig } from './models/permit2-approve-config';
import {
  EvmAdapter,
  EvmBasicTransactionOptions,
  EvmTransactionConfig,
  FailedToCheckForTransactionReceiptError,
  isApprovableAdapter,
  parseError,
  UnnecessaryApproveError,
  UserRejectError
} from '@cryptorubic/web3';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { withRetryWhile } from '@app/features/trade/utils/with-retry';

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
    return this.useProxy
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

  public async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
    await this.checkWalletState(options?.testMode);
    await this.checkAllowanceAndApprove(options);

    const { onConfirm, onSimulationSuccess } = options;
    let transactionHash: string;
    const onTransactionHash = (hash: string) => {
      if (onConfirm) {
        onConfirm(hash);
      }
      transactionHash = hash;
    };

    const fromAddress = this.walletAddress;
    const { data, value, to, gas } = await this.encode({ ...options, fromAddress });

    const allowedToSign = await onSimulationSuccess?.();
    if (!allowedToSign) throw new UserRejectError('manual transaction reject');

    const method = options?.testMode ? 'sendTransaction' : 'trySendTransaction';

    try {
      await this.chainAdapter.signer[method]({
        txOptions: {
          data,
          to,
          value,
          gas,
          onTransactionHash,
          gasPriceOptions: options.gasPriceOptions,
          ...(options?.useEip155 && {
            chainId: `0x${blockchainId[this.from.blockchain].toString(16)}`
          }),
          gasLimitRatio: options.gasLimitRatio
        }
      });

      return transactionHash!;
    } catch (err) {
      // waiting for update of allowance on ERC20 token contract
      if (err.message.includes('transfer amount exceeds allowance')) {
        if (isApprovableAdapter(this.chainAdapter)) {
          await withRetryWhile(
            () => this.needApprove(),
            needApprove => needApprove === true,
            5
          );
        }
        return this.swap({ ...options, useCacheData: true, skipAmountCheck: true });
      }

      if (err instanceof FailedToCheckForTransactionReceiptError) {
        return transactionHash!;
      }

      throw parseError(err);
    }
  }

  public async encode(options: EncodeTransactionOptions): Promise<EvmTransactionConfig> {
    await this.checkFromAddress(options.fromAddress, true);
    await this.checkReceiverAddress(options.receiverAddress);

    return this.setTransactionConfig(options);
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

    const config: EvmTransactionConfig = {
      data: swapData.transaction.data!,
      value: swapData.transaction.value!,
      to: swapData.transaction.to!,
      gas: swapData.fees.gasTokenFees.gas.gasLimit!
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
}
