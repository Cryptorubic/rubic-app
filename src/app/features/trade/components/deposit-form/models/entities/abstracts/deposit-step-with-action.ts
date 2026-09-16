import { BehaviorSubject } from 'rxjs';
import { ActionBtnState, DepositStepParams } from '../../step-types';
import { DepositStep } from './deposit-step';
import { DepositFormSteps } from '../../deposit-form-step-types';
import { DepositFormState } from '../../deposit-form-states';

export abstract class DepositStepWithAction<T = string> extends DepositStep {
  private _actionBtnState: ActionBtnState;

  public get actionBtnState(): ActionBtnState {
    return this._actionBtnState;
  }

  constructor(
    params: DepositStepParams,
    _depositFormState$: BehaviorSubject<DepositFormState>,
    _depositFormSteps$: BehaviorSubject<DepositFormSteps>,
    actionBtnState: ActionBtnState
  ) {
    super(params, _depositFormState$, _depositFormSteps$);
    this._actionBtnState = actionBtnState;
  }

  public abstract doAction(action: T): Promise<void>;

  protected updateActionBtnState(state: Partial<ActionBtnState>): void {
    this._actionBtnState = { ...this._actionBtnState, ...state };
  }
}

export function isDepositStepWithAction(
  step: DepositStep | DepositStepWithAction
): step is DepositStepWithAction {
  return 'doAction' in step ? true : false;
}
