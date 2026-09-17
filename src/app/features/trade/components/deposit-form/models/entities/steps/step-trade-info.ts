import { BehaviorSubject } from 'rxjs';
import {
  DEPOSIT_STEP_NAME,
  DepositFormSteps,
  DepositStepName
} from '../../deposit-form-step-types';
import { ActionBtnState, DepositStepParams } from '../../step-types';
import { DepositStepWithAction } from '../abstracts/deposit-step-with-action';
import { DEPOSIT_STEP_ORDER } from '../../deposit-step-order';
import { TradeInfoStepAction } from '../../deposit-form-step-actions';
import { DEPOSIT_FORM_STATE, DepositFormState } from '../../deposit-form-states';

export class TradeInfoStep extends DepositStepWithAction<TradeInfoStepAction> {
  public readonly name: DepositStepName = DEPOSIT_STEP_NAME.TRADE_INFO;

  constructor(
    _depositFormState$: BehaviorSubject<DepositFormState>,
    _depositFormSteps$: BehaviorSubject<DepositFormSteps>
  ) {
    const depositStepParams: DepositStepParams = { active: false, loading: false, opened: false };
    const actionBtnState: ActionBtnState = { active: true, text: 'Translated funds is done' };
    super(depositStepParams, _depositFormState$, _depositFormSteps$, actionBtnState);
  }

  public async doAction(action: TradeInfoStepAction): Promise<void> {
    if (action === 'confirm_deposit') {
      const inputAddrStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.INPUT_ADDRESSES];
      inputAddrStep.setActive(false);
      inputAddrStep.setOpened(false);

      const tradeStatusStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.TRADE_STATUS];
      tradeStatusStep.setActive(true);
      tradeStatusStep.setOpened(true);

      this.setOpened(false);
      this.updateActionBtnState({ active: false });
      this._depositFormState$.next(DEPOSIT_FORM_STATE.STATUS_TRACKING);
    } else {
      // @TODO_3003 ENCODE TRANSFER DATA AND HANDLE WALLET SIGANTURE
    }
  }
}
