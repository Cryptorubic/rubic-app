import { ExchangeDetailsStep } from '../entities/steps/step-exchange-details';
import { InputAddressesStep } from '../entities/steps/step-input-addresses';
import { TradeInfoStep } from '../entities/steps/step-trade-info';
import { TradeStatusStep } from '../entities/steps/step-trade-status';

const DEPOSIT_STEP_WITH_ACTION_NAME = {
  INPUT_ADDRESSES: 'INPUT_ADDRESSES',
  TRADE_INFO: 'TRADE_INFO'
} as const;

export const DEPOSIT_STEP_NAME = {
  EXCHANGE_DETAILS: 'EXCHANGE_DETAILS',
  ...DEPOSIT_STEP_WITH_ACTION_NAME,
  TRADE_STATUS: 'TRADE_STATUS'
} as const;

export type DepositStepWithActionName =
  (typeof DEPOSIT_STEP_WITH_ACTION_NAME)[keyof typeof DEPOSIT_STEP_WITH_ACTION_NAME];
export type DepositStepName = (typeof DEPOSIT_STEP_NAME)[keyof typeof DEPOSIT_STEP_NAME];

export type DepositFormSteps = [
  ExchangeDetailsStep,
  InputAddressesStep,
  TradeInfoStep,
  TradeStatusStep
];
