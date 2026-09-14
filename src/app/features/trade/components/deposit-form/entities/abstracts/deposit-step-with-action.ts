import { ActionBtnState, DepositStepParams } from '../../models/step-types';
import { DepositStep } from './deposit-step';

export abstract class DepositStepWithAction extends DepositStep {
  public _actionBtnState: ActionBtnState;

  constructor(params: DepositStepParams, actionBtnState: ActionBtnState) {
    super(params);
    this._actionBtnState = actionBtnState;
  }

  public abstract doAction(): void;

  protected updateActionBtnState(newState: Partial<ActionBtnState>): void {
    this._actionBtnState = { ...this._actionBtnState, ...newState };
  }
}

export function isDepositStepWithAction(
  step: DepositStep | DepositStepWithAction
): step is DepositStepWithAction {
  return 'doAction' in step ? true : false;
}
