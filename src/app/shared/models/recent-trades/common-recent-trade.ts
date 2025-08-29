import { ChangenowApiStatus, TxStatus } from '@cryptorubic/sdk';
import { Token } from '@shared/models/tokens/token';

export interface CommonRecentTrade {
  srcTxHash?: string;
  dstTxHash?: string;

  toToken: Token;

  timestamp: number;
  rubicId: string;

  calculatedStatusTo?: TxStatus | ChangenowApiStatus;
  calculatedStatusFrom?: TxStatus | ChangenowApiStatus;
}
