export const CROSS_CHAIN_DEPOSIT_STATUS = {
    WAITING: 'waiting',
    CONFIRMING: 'confirming',
    EXCHANGING: 'exchanging',
    SENDING: 'sending',
    FINISHED: 'finished',
    FAILED: 'failed',
    EXPIRED: 'expired',
    REFUNDED: 'refunded',
    VERIFYING: 'verifying'
};

export type CrossChainDepositStatus = (typeof CROSS_CHAIN_DEPOSIT_STATUS)[keyof typeof CROSS_CHAIN_DEPOSIT_STATUS];

export interface CrossChainDepositData {
    status: CrossChainDepositStatus;
    dstHash: string | null;
}
