import { TxStatus } from 'rubic-sdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';

export interface CommonRecentTrade {
  srcTxHash: string;
  dstTxHash?: string;

  toToken: TokenAmount;

  timestamp: number;

  calculatedStatusTo?: TxStatus;
  calculatedStatusFrom?: TxStatus;
}
