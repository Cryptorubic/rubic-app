import { DepositFormState } from '../models/deposit-form-states';

export const DEPOSIT_FORM_TITLE: Record<DepositFormState, string> = {
  IDLE: 'Enter Addresses',
  WAITING_FOR_SENDING_DEPOSIT: 'Deposit Funds',
  STATUS_TRACKING: 'Exchange Status',
  COMPLETED: 'Trade Completed'
};
