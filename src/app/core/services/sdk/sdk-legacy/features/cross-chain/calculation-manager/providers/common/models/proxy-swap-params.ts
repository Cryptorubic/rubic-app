import { EvmBlockchainName, PriceTokenAmount } from '@cryptorubic/core';
import { EncodeTransactionOptions } from '../../../../../common/models/encode-transaction-options';
import { EvmTransactionConfig } from '@cryptorubic/web3';

export interface ProxySwapParams {
  walletAddress: string;
  contractAddress: string;
  fromTokenAmount: PriceTokenAmount<EvmBlockchainName>;
  toTokenAmount: PriceTokenAmount;
  onChainEncodeFn: (options: EncodeTransactionOptions) => Promise<EvmTransactionConfig>;
}
