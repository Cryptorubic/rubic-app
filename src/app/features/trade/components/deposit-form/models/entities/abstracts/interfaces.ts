import { DepositStep } from './deposit-step';

export interface IWithHooks {
  onInit: () => void;
  onDestroy: () => void;
}

export function isStepWithHooks(step: DepositStep): step is DepositStep & IWithHooks {
  if ('onDestroy' in step && 'onInit' in step) return true;
  return false;
}
