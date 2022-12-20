import { BlockchainName, TxStatus } from 'rubic-sdk';
import { Token } from '@shared/models/tokens/token';
import { AssetType } from '@features/swaps/shared/models/form/asset';
import { FiatAsset } from '@shared/models/fiats/fiat-asset';

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
  statusFrom?: TxStatus;
  statusTo?: TxStatus;
}
