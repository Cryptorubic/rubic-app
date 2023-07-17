import { OnramperTransactionStatus } from '@features/swaps/features/onramper-exchange/models/onramper-transaction-status';

export interface OnramperTransactionInfo {
  status: OnramperTransactionStatus;
  transaction_id: string;
  user: string;
  out_amount: string;
  additional_info: string; // JSON object { id: string; isDirect: boolean }
  tx_hash?: string;
}
