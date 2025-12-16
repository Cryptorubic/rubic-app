import { BlockchainName } from '@cryptorubic/core';
import { TransactionStep } from '@features/trade/models/transaction-steps';

export interface TransactionState {
  readonly step: TransactionStep;
  readonly data: {
    hash?: string;
    toBlockchain?: BlockchainName;
    wrongNetwork?: boolean;
    activeWallet?: boolean;
    points?: number;
    needTrustline?: boolean;
  };
}
