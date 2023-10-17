import { BlockchainName, ChangenowApiStatus, TxStatus } from 'rubic-sdk';
import { Token } from '@shared/models/tokens/token';
import { FiatAsset } from '@shared/models/fiats/fiat-asset';
import { AssetType } from '@features/trade/models/asset';

export interface UiRecentTrade {
  fromAssetType: AssetType;
  toBlockchain: BlockchainName;
  fromAsset: Token | FiatAsset;
  toToken: Token;
  timestamp: number;
  srcTxLink?: string | null;
  srcTxHash?: string | null;
  dstTxHash?: string | null;
  dstTxLink?: string | null;
  statusFrom?: TxStatus | ChangenowApiStatus;
  statusTo?: TxStatus | ChangenowApiStatus;
  fromAmount?: string;
  toAmount?: string;
}
