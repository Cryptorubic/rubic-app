import { RouterQuoteResponseConfig } from './router-quote-response-config';

export interface RouterSendTransactionParams extends RouterQuoteResponseConfig {
    senderAddress: string;
    receiverAddress: string;
    refundAddress: string;
}

export interface RouterSendTransactionResponse extends RouterSendTransactionParams {
    txn: {
        from: string;
        value: string;
        to: string;
        data: string;
        gasPrice: string;
        gasLimit: string;
    };
}

export interface RouterTxStatusResponse {
    status: 'completed' | 'pending';
    dest_tx_hash: string;
}
