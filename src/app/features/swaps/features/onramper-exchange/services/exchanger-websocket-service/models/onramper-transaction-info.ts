import { OnramperTransactionStatus } from '@features/swaps/features/onramper-exchange/services/exchanger-websocket-service/models/onramper-transaction-status';

export interface OnramperTransactionInfo {
  status: OnramperTransactionStatus;
  transaction_id: string;
  additional_info: {
    wallet_address: string;
  };
  out_amount: string;
}
