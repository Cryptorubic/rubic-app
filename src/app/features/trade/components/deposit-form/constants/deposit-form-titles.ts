import { DepositFormState } from '../models/deposit-form-states';

export const DEPOSIT_FORM_TITLE_WITH_FLOWS: Record<DepositFormState, string> = {
  IDLE: 'Choose Transfer Method',
  INPUT_ADDRESSES: 'Enter Addresses',
  WAITING_FOR_SENDING_DEPOSIT: 'Confirm Transfer',
  WAITING_FOR_SIGNING_TRANSFER: 'Confirm Transfer',
  STATUS_TRACKING: 'Swap in Progress',
  COMPLETED: ''
};

export const DEPOSIT_FORM_TITLE_WITHOUT_FLOWS: Record<DepositFormState, string> = {
  IDLE: 'Enter Addresses',
  INPUT_ADDRESSES: 'Enter Addresses',
  WAITING_FOR_SENDING_DEPOSIT: 'Confirm Transfer',
  WAITING_FOR_SIGNING_TRANSFER: 'Confirm Transfer',
  STATUS_TRACKING: 'Swap in Progress',
  COMPLETED: ''
};
