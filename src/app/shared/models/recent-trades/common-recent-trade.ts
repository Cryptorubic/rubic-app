import { TxStatus } from '@cryptorubic/web3';
import { Token } from '@shared/models/tokens/token';

export interface CommonRecentTrade {
  srcTxHash?: string;
  dstTxHash?: string;

  toToken: Token;

  timestamp: number;
  rubicId: string;

  calculatedStatusTo?: TxStatus;
  calculatedStatusFrom?: TxStatus;
}
