import { OnramperTransactionStatus } from '@features/swaps/features/onramper-exchange/services/onramper-websocket-service/models/onramper-transaction-status';

export interface OnrampTradeApi {
  user: string;
  status: OnramperTransactionStatus;
  transaction_id: string;
  tx_hash: string;
  out_currency: 'BNB';
  out_amount: '0.095961760066900000';
}

export interface OnrampTradeApiResponse {
  results: OnrampTradeApi[];
}
