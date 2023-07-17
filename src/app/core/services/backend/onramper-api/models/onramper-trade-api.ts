import { OnramperTransactionStatus } from '@features/swaps/features/onramper-exchange/models/onramper-transaction-status';

export interface OnramperTradeApi {
  user: string;
  status: OnramperTransactionStatus;
  transaction_id: string;
  tx_hash: string;
  out_currency: string;
  out_amount: string;
}

export interface OnramperTradeApiResponse {
  results: OnramperTradeApi[];
}
