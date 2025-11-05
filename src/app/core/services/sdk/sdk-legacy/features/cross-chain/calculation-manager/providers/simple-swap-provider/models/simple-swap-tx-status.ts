export const SIMPLE_SWAP_TX_STATUS = {
    CONFIRMING: 'confirming',
    EXCHANGING: 'exchanging',
    EXPIRED: 'expired',
    FAILED: 'failed',
    FINISHED: 'finished',
    REFUNDED: 'refunded',
    SENDING: 'sending',
    VERYFYING: 'verifying',
    WAITING: 'waiting'
} as const;

export type SimpleSwapTxStatus = (typeof SIMPLE_SWAP_TX_STATUS)[keyof typeof SIMPLE_SWAP_TX_STATUS];
