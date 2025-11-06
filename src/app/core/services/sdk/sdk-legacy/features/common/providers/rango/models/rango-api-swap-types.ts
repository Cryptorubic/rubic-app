import { RangoBestRouteRequestOptions, RangoBestRouteResponse } from './rango-api-best-route-types';

export interface RangoSwapRequestOptions extends RangoBestRouteRequestOptions {
  receiverAddress?: string;
  fromAddress?: string;
}

export interface RangoSwapTransactionResponse extends RangoBestRouteResponse {
  tx: RangoTransaction | null | RangoTransfer;
}

export interface RangoTransaction {
  type: 'EVM';
  blockChain: RangoEvmBlockchainMeta;
  from: string | null;
  approveTo: string | null;
  approveData: string | null;
  txTo: string;
  txData: string | null;
  value: string | null;
  gasLimit: string | null;
  gasPrice: string | null;
  maxPriorityFeePerGas: string | null;
  maxFeePerGas: string | null;
}

export interface RangoTransfer {
  type: 'TRANSFER';
  recipientAddress: string;
  memo?: string;
}

interface RangoEvmBlockchainMeta {
  type: 'EVM';
  name: string;
  shortName: string;
  displayName: string;
  defaultDecimals: number;
  feeAssets: RangoFeeAsset[];
  addressPatterns: string[];
  logo: string;
  color: string;
  sort: number;
  enabled: boolean;
  chainId: string | null;
  info: RangoEvmChainInfo;
}

interface RangoFeeAsset {
  blockchain: string;
  address: string | null;
  symbol: string;
}

interface RangoEvmChainInfo {
  infoType: 'EvmMetaInfo';
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  addressUrl: string;
  transactionUrl: string;
}
