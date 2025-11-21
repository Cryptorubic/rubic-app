import { SuiBlockchainName } from '@cryptorubic/core';
import {
  BitcoinBlockchainName,
  EvmBlockchainName,
  SolanaBlockchainName,
  TonBlockchainName,
  TronBlockchainName
} from '@cryptorubic/core';

/**
 * Stores information about rpc in certain blockchain.
 */
export interface RpcProvider<T> {
  /**
   * Contains rpc links in order of prioritization.
   */
  readonly rpcList: T[];
}

export type RpcProviders = Partial<
  Record<EvmBlockchainName, RpcProvider<string>> &
    Record<TronBlockchainName, RpcProvider<TronWebProvider>> &
    Record<SolanaBlockchainName, RpcProvider<string>> &
    Record<TonBlockchainName, RpcProvider<string>> &
    Record<BitcoinBlockchainName, RpcProvider<string>> &
    Record<SuiBlockchainName, RpcProvider<string>>
>;

export interface TronWebProvider {
  fullHost: string;
  headers?: Record<string, string>;
}
