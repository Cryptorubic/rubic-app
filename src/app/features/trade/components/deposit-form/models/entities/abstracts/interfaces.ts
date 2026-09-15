import { DepositStep } from './deposit-step';

export interface IWithOnDestroy {
  onDestroy: () => void;
}

export function withOnDestroy(step: DepositStep): step is DepositStep & IWithOnDestroy {
  if ('onDestroy' in step) return true;
  return false;
}
