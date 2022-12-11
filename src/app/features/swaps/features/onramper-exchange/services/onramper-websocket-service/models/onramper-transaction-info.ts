import { OnramperTransactionStatus } from '@features/swaps/features/onramper-exchange/services/onramper-websocket-service/models/onramper-transaction-status';

export interface OnramperTransactionInfo {
  status: OnramperTransactionStatus;
  transaction_id: string;
  user: string;
  out_amount: string;
}
