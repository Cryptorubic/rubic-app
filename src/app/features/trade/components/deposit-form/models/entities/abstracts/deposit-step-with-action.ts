import { BehaviorSubject } from 'rxjs';
import { ActionBtnState, DepositStepParams } from '../../step-types';
import { DepositStep } from './deposit-step';
import { DepositFormSteps } from '../../deposit-form-step-types';
import { DepositFormState } from '../../deposit-form-states';

export abstract class DepositStepWithAction<T extends string = string> extends DepositStep {
  private readonly _actionButtonsMap: Record<T, ActionBtnState>;

  public get actionButtonsMap(): Record<T, ActionBtnState> {
    return this._actionButtonsMap;
  }

  constructor(
    params: DepositStepParams,
    _depositFormState$: BehaviorSubject<DepositFormState>,
    _depositFormSteps$: BehaviorSubject<DepositFormSteps>,
    actionButtonsMap: Record<T, ActionBtnState>
  ) {
    super(params, _depositFormState$, _depositFormSteps$);
    this._actionButtonsMap = actionButtonsMap;
  }

  public abstract doAction(action: T): Promise<void>;

  public updateActionBtnState(btnName: T, state: Partial<ActionBtnState>): void {
    this._actionButtonsMap[btnName] = { ...this._actionButtonsMap[btnName], ...state };
  }
}

export function isDepositStepWithAction(
  step: DepositStep | DepositStepWithAction
): step is DepositStepWithAction {
  return 'doAction' in step ? true : false;
}
