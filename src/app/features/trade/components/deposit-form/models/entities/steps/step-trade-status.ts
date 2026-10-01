import { BehaviorSubject } from 'rxjs';
import {
  DEPOSIT_STEP_NAME,
  DepositFormSteps,
  DepositStepName
} from '../../deposit-form-step-types';
import { DepositStepParams } from '../../step-types';
import { DepositStep } from '../abstracts/deposit-step';
import { DepositFormState } from '../../deposit-form-states';

export class TradeStatusStep extends DepositStep {
  public readonly name: DepositStepName = DEPOSIT_STEP_NAME.TRADE_INFO;

  constructor(
    _depositFormState$: BehaviorSubject<DepositFormState>,
    _depositFormSteps$: BehaviorSubject<DepositFormSteps>
  ) {
    const depositStepParams: DepositStepParams = { active: false, loading: false, opened: false };
    super(depositStepParams, _depositFormState$, _depositFormSteps$);
  }
}
