import { TxStatus } from 'rubic-sdk';
import { Token } from '@shared/models/tokens/token';

export interface CommonRecentTrade {
  srcTxHash?: string;
  dstTxHash?: string;

  toToken: Token;

  timestamp: number;

  calculatedStatusTo?: TxStatus;
  calculatedStatusFrom?: TxStatus;
}
