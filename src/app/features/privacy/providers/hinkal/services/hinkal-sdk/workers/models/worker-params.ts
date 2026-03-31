import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { BlockchainName, EvmBlockchainName } from '@cryptorubic/core';

export type HinkalWorkerType =
  | 'init'
  | 'updateBalance'
  | 'switchNetwork'
  | 'withdraw'
  | 'deposit'
  | 'transfer'
  | 'quote'
  | 'swap'
  | 'stop';

export interface PureTokenAmount<T extends BlockchainName = BlockchainName> {
  stringWeiAmount: string;
  address: string;
  blockchain: T;
  decimals: number;
  name: string;
  symbol: string;
}
export interface WorkerParams<T extends object = object> {
  type: HinkalWorkerType;
  params: T;
  // address?: string;
  // chainId?: number;
  // signature?: string;
  // token?: PureTokenAmount<EvmBlockchainName>;
}

export interface WorkerResponse<T> {
  type: HinkalWorkerType;
  result: T;
  error?: string;
  success: boolean;
}

export type InitParams = {
  address: string;
  chainId: number;
  signature: string;
};

export type WithdrawParams = {
  token: PureTokenAmount<EvmBlockchainName>;
  receiver?: string;
};

export type TransferParams = Required<WithdrawParams>;

export type QuoteParams = {
  fromAsset: BalanceToken;
  toAsset: BalanceToken;
  fromTokenStringAmount: string;
};

export type SwapParams = {
  fromToken: PureTokenAmount<EvmBlockchainName>;
  toToken: PureTokenAmount<EvmBlockchainName>;
};

export type DepositParams = Omit<WithdrawParams, 'receiver'>;

export type SwitchNetworkParams = Omit<InitParams, 'signature'>;
