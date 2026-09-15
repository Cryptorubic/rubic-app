import { BehaviorSubject } from 'rxjs';
import {
  DEPOSIT_STEP_NAME,
  DepositFormSteps,
  DepositStepName
} from '../../deposit-form-step-types';
import { ActionBtnState, DepositStepParams } from '../../step-types';
import { DepositStepWithAction } from '../abstracts/deposit-step-with-action';
import { DepositFormInfo } from '../../deposit-form-info';
import { DEPOSIT_STEP_ORDER } from '../../deposit-step-order';
import { TradeInfoStepAction } from '../../deposit-form-step-actions';

export class TradeInfoStep extends DepositStepWithAction<TradeInfoStepAction> {
  public readonly name: DepositStepName = DEPOSIT_STEP_NAME.TRADE_INFO;

  constructor(
    _depositFormInfo$: BehaviorSubject<DepositFormInfo>,
    _depositFormSteps$: BehaviorSubject<DepositFormSteps>
  ) {
    const depositStepParams: DepositStepParams = { active: false, loading: false, opened: false };
    const actionBtnState: ActionBtnState = { active: true, text: 'Translated funds is done' };
    super(depositStepParams, _depositFormInfo$, _depositFormSteps$, actionBtnState);
  }

  public async doAction(action: TradeInfoStepAction): Promise<void> {
    if (action === 'confirm_deposit') {
      const inputAddrStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.INPUT_ADDRESSES];
      inputAddrStep.setActive(false);
      inputAddrStep.setOpened(false);

      const tradeStatusStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.TRADE_STATUS];
      tradeStatusStep.setActive(true);
      tradeStatusStep.setOpened(true);

      this.setActive(false);
      this.setOpened(false);
    } else {
      // @TODO_3003 ENCODE TRANSFER DATA AND OPEN WALLET SIGANTURE
    }
  }
}
