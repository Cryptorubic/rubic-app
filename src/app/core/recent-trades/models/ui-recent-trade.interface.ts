import { Blockchain } from '@app/shared/constants/blockchain/ui-blockchains';
import { TxStatus } from 'rubic-sdk';
import { BlockchainToken } from '@shared/models/tokens/blockchain-token';

export interface UiRecentTrade {
  fromBlockchain: Blockchain;
  toBlockchain: Blockchain;
  fromToken: BlockchainToken;
  toToken: BlockchainToken;
  timestamp: number;
  srcTxLink: string;
  srcTxHash: string;
  dstTxHash?: string | null;
  dstTxLink?: string | null;
  statusFrom?: TxStatus;
  statusTo?: TxStatus;
}
