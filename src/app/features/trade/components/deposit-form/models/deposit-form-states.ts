import { GeneralStepAction } from './deposit-form-step-actions';

export const DEPOSIT_FORM_STATE = {
  IDLE: 'IDLE',
  WAITING_FOR_SENDING_DEPOSIT: 'WAITING_FOR_SENDING_DEPOSIT',
  STATUS_TRACKING: 'STATUS_TRACKING',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED'
} as const;

export type DepositFormState = (typeof DEPOSIT_FORM_STATE)[keyof typeof DEPOSIT_FORM_STATE];

export const DEPOSIT_STATE_AFTER_ACTION: Record<GeneralStepAction, DepositFormState> = {
  confirm_addresses: DEPOSIT_FORM_STATE.WAITING_FOR_SENDING_DEPOSIT,
  change_addresses: DEPOSIT_FORM_STATE.IDLE,
  confirm_deposit: DEPOSIT_FORM_STATE.STATUS_TRACKING,
  send_via_wallet: DEPOSIT_FORM_STATE.STATUS_TRACKING
} as const;
