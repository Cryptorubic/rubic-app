import { SimpleSwapTxStatus } from './simple-swap-tx-status';

export interface SimpleSwapExchange {
  result: {
    /* used for checking tx-status */
    id: string;
    type: 'fixed' | 'floating';
    timestamp: string;
    updated_at: string;
    valid_until: string;
    tickerFrom: string;
    tickerTo: string;
    networkFrom: string;
    networkTo: string;
    amountFrom: string;
    expected_amount: string;
    amountTo: string;
    addressFrom: string;
    addressTo: string;
    extraIdFrom: string;
    extraIdTo: string;
    userRefundAddress: string;
    userRefundExtraId: string;
    txFrom: string;
    txTo: string;
    status: SimpleSwapTxStatus;
  };
}
