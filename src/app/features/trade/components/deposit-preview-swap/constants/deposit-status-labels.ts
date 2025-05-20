import { CROSS_CHAIN_DEPOSIT_STATUS, CrossChainDepositStatus } from 'rubic-sdk';

export const DEPOSIT_STATUS_LABELS: Record<CrossChainDepositStatus, string> = {
  [CROSS_CHAIN_DEPOSIT_STATUS.WAITING]: 'Awaiting deposit',
  [CROSS_CHAIN_DEPOSIT_STATUS.CONFIRMING]: 'Confirming',
  [CROSS_CHAIN_DEPOSIT_STATUS.EXCHANGING]: 'Exchanging',
  [CROSS_CHAIN_DEPOSIT_STATUS.FINISHED]: 'Sending to you',
  [CROSS_CHAIN_DEPOSIT_STATUS.SENDING]: 'Sending to you'
};
