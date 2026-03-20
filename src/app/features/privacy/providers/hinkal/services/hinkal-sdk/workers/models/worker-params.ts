import { BlockchainName, EvmBlockchainName } from '@cryptorubic/core';

export type HinkalWorkerType =
  | 'init'
  | 'updateBalance'
  | 'switchNetwork'
  | 'refreshStoredSnapshot'
  | 'withdraw';

export interface PureTokenAmount<T extends BlockchainName = BlockchainName> {
  stringWeiAmount: string;
  address: string;
  blockchain: T;
  decimals: number;
  name: string;
  symbol: string;
}
export interface WorkerParams {
  type: HinkalWorkerType;
  address?: string;
  chainId?: number;
  signature?: string;
  token?: PureTokenAmount<EvmBlockchainName>;
}

export interface WorkerResponse<T> {
  type: HinkalWorkerType;
  result: T;
}
