import { BlockchainName } from '@cryptorubic/core';
import { TransactionStep } from '@features/trade/models/transaction-steps';
import { NeedTrustlineOptions } from '../services/trustline-service/models/need-trustline-options';

export interface TransactionState {
  readonly step: TransactionStep;
  readonly data: {
    hash?: string;
    toBlockchain?: BlockchainName;
    wrongNetwork?: boolean;
    activeWallet?: boolean;
    points?: number;
    needTrustlineOptions?: NeedTrustlineOptions;
  };
  level?: number;
}
