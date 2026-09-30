import { DEPOSIT_STEP_ORDER } from './deposit-step-order';

export const STEP_ACTION = {
  [DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS]: [],
  [DEPOSIT_STEP_ORDER.INPUT_ADDRESSES]: ['confirm_addresses', 'change_addresses'] as const,
  [DEPOSIT_STEP_ORDER.TRADE_INFO]: ['confirm_deposit', 'send_via_wallet'] as const,
  [DEPOSIT_STEP_ORDER.TRADE_STATUS]: []
} as const;

export type InputAddressesStepAction =
  (typeof STEP_ACTION)[DEPOSIT_STEP_ORDER.INPUT_ADDRESSES][number];

export type TradeInfoStepAction = (typeof STEP_ACTION)[DEPOSIT_STEP_ORDER.TRADE_INFO][number];

export type GeneralStepAction = (typeof STEP_ACTION)[keyof typeof STEP_ACTION][number];
