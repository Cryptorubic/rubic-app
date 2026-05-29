import { TransactionStep } from '@app/features/trade/models/transaction-steps';

type StepState = 'fullfilled' | 'pending' | 'failed' | 'default';

export interface StepsType {
  key: TransactionStep;
  value: string;
  status: StepState;
}
