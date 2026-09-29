import { TransactionInterface } from 'node_modules/@cryptorubic/core/src/lib/models/api/transaction.interface';

export interface OnChainTransferConfig extends TransactionInterface {
  extraFields?: {
    name: string;
    value: string;
  };
}
