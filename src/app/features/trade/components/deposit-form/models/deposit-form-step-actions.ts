import { DEPOSIT_STEP_ORDER } from './deposit-step-order';
import { ActionBtnState } from './step-types';

export const STEP_ACTION = {
  [DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS]: ['select_manual_flow', 'select_via_wallet'],
  [DEPOSIT_STEP_ORDER.INPUT_ADDRESSES]: ['confirm_addresses', 'change_addresses'],
  [DEPOSIT_STEP_ORDER.TRADE_INFO]: ['confirm_deposit', 'send_via_wallet'],
  [DEPOSIT_STEP_ORDER.TRADE_STATUS]: []
} as const;

export type ExchangeDetailsStepAction =
  (typeof STEP_ACTION)[DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS][number];

export type InputAddressesStepAction =
  (typeof STEP_ACTION)[DEPOSIT_STEP_ORDER.INPUT_ADDRESSES][number];

export type TradeInfoStepAction = (typeof STEP_ACTION)[DEPOSIT_STEP_ORDER.TRADE_INFO][number];

export type GeneralStepAction = (typeof STEP_ACTION)[keyof typeof STEP_ACTION][number];

export type ActionButtonStatesMap = {
  [K in DEPOSIT_STEP_ORDER]: Record<(typeof STEP_ACTION)[K][number], ActionBtnState>;
};
