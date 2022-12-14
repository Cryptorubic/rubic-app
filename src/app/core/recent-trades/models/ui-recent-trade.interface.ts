import { Blockchain } from '@app/shared/constants/blockchain/ui-blockchains';
import { TxStatus } from 'rubic-sdk';
import { Token } from '@shared/models/tokens/token';

export interface UiRecentTrade {
  fromBlockchain: Blockchain;
  toBlockchain: Blockchain;
  fromToken: Token;
  toToken: Token;
  timestamp: number;
  srcTxLink: string;
  srcTxHash: string;
  dstTxHash?: string | null;
  dstTxLink?: string | null;
  statusFrom?: TxStatus;
  statusTo?: TxStatus;
}
