import {
  FromBackendOnChainProvider,
  ToBackendCrossChainProviders,
  ToBackendOnChainProvider
} from '@cryptorubic/core';
import { BackendBlockchain, CrossChainTradeType } from '@cryptorubic/sdk';

export type OnChainRewardResponse = {
  [key in ToBackendOnChainProvider]: ProviderRewardData;
};

export type CrossChainRewardResponse = {
  [key in ToBackendCrossChainProviders]: ProviderRewardData;
};

export type OnChainRewardConvertedData = {
  [key in FromBackendOnChainProvider]: ProviderRewardData;
};

export type CrossChainRewardConvertedData = {
  [key in CrossChainTradeType]: ProviderRewardData;
};

export interface ProviderRewardData {
  amount: number;
  integrator_address: string;
}

export interface CrossChainRewardRequestParams {
  /**
   * user wallet address
   */
  address: string;
  from_network: BackendBlockchain;
  to_network: BackendBlockchain;
  /**
   * fromToken address
   */
  from_token: string;
  /**
   * toToken address
   */
  to_token: string;
}

export interface OnChainRewardRequestParams {
  address: string;
  network: BackendBlockchain;
  from_token: string;
  to_token: string;
}
