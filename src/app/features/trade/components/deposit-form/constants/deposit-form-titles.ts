import { DepositFormState } from '../models/deposit-form-states';

export const DEPOSIT_FORM_TITLE: Record<DepositFormState, string> = {
  IDLE: 'Enter Addresses',
  INPUT_ADDRESSES: 'Enter Addresses',
  WAITING_FOR_SENDING_DEPOSIT: 'Deposit Funds',
  WAITING_FOR_SIGNING_TRANSFER: 'Deposit Funds',
  STATUS_TRACKING: 'Swap Status',
  COMPLETED: ''
};
