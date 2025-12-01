import { ChangenowApiStatus } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/changenow-provider/models/changenow-api-response';
import { TxStatus } from '@cryptorubic/web3';
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
