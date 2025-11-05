import { EncodeTransactionOptions } from '../../../../common/models/encode-transaction-options';
import { wrapAbi } from './wrap-abi';
import { EvmOnChainTrade } from '../on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { EvmOnChainTradeStruct } from '../on-chain-trade/evm-on-chain-trade/models/evm-on-chain-trade-struct';
import { EvmEncodedConfigAndToAmount } from '../../models/aggregator-on-chain-types';
import { ON_CHAIN_TRADE_TYPE } from '../../models/on-chain-trade-type';
import { EvmAdapter, RubicSdkError, Web3Pure } from '@cryptorubic/web3';
import { compareAddresses, EvmBlockchainName, wrappedAddress } from '@cryptorubic/core';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';

export class EvmWrapTrade extends EvmOnChainTrade {
  public get dexContractAddress(): string {
    return this.from.isNative ? this.to.address : this.from.address;
  }

  public readonly type = ON_CHAIN_TRADE_TYPE.WRAPPED;

  protected async getTransactionConfigAndAmount(
    options: EncodeTransactionOptions
  ): Promise<EvmEncodedConfigAndToAmount> {
    await this.checkFromAddress(options.fromAddress, true);

    const methodName = this.from.isNative ? 'deposit' : 'withdraw';

    const config = EvmAdapter.encodeMethodCall(
      this.dexContractAddress,
      wrapAbi,
      methodName,
      this.from.isNative ? [] : [this.from.stringWeiAmount],
      this.from.isNative ? this.from.stringWeiAmount : '0'
    );

    return { tx: config, toAmount: this.to.stringWeiAmount };
  }

  public constructor(
    evmOnChainTradeStruct: EvmOnChainTradeStruct,
    sdkLegacyService: SdkLegacyService
  ) {
    super(evmOnChainTradeStruct, sdkLegacyService);
  }

  public static isSupportedBlockchain(blockchain: EvmBlockchainName): boolean {
    return Boolean(wrappedAddress?.[blockchain]);
  }

  public static isSupportedTrade(
    blockchain: EvmBlockchainName,
    fromAddress: string,
    toAddress: string
  ): boolean {
    if (!EvmWrapTrade.isSupportedBlockchain) {
      throw new RubicSdkError('Trade is not supported');
    }
    const wethAddress = wrappedAddress[blockchain]!;

    return (
      (compareAddresses(fromAddress, Web3Pure.getEmptyTokenAddress(blockchain)) &&
        compareAddresses(toAddress, wethAddress)) ||
      (compareAddresses(toAddress, Web3Pure.getEmptyTokenAddress(blockchain)) &&
        compareAddresses(fromAddress, wethAddress))
    );
  }

  public override async needApprove(_fromAddress?: string): Promise<boolean> {
    return false;
  }
}
