import { ProviderAddress } from './provider-address';
import { RpcProviders } from './rpc-provider';
import { WalletProvider } from './wallet-provider';

import { EnvType } from './env-type';
import { HttpClient } from '@cryptorubic/core';
import { ViemChainConfig } from '@cryptorubic/web3';

/**
 * Main sdk configuration.
 */
export interface Configuration {
  /**
   * Rpc data to connect to blockchains you will use.
   * You have to pass rpcProvider for each blockchain you will use with sdk.
   */
  readonly rpcProviders: RpcProviders;

  /**
   * Required to use `swap`, `approve` and other methods which sends transactions.
   * But you can calculate and encode trades without `walletProvider`.
   * Pass it when user connects wallet. Please note that `address` and `chainId` must
   * match account address and selected chain id in a user's wallet.
   */
  readonly walletProvider?: WalletProvider;

  /**
   * You can pass your own http client (e.g. HttpClient in Angular) if you have it,
   * to not duplicate http clients and decrease bundle size.
   */
  readonly httpClient?: HttpClient;

  /**
   * Integrator wallet address.
   */
  readonly providerAddress?: Partial<ProviderAddress>;

  /**
   * Api env type
   */
  readonly envType?: EnvType;

  readonly viemConfig?: ViemChainConfig;
}
