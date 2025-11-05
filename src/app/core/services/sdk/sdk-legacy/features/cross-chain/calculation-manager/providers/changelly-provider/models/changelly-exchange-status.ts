export interface ChangellyExchangeStatusResponse {
    id: string;
    payinHash: string | null;
    payoutHash: string | null;
    status: ChangellyTxStatus;
}

type ChangellyTxStatus =
    | 'new'
    | 'waiting'
    | 'confirming'
    | 'exchanging'
    | 'sending'
    | 'finished'
    | 'failed'
    | 'refunded'
    | 'hold'
    | 'overdue'
    | 'expired';
