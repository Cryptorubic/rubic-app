import { DEPOSIT_STEP_NAME, DepositStepName } from '../../models/deposit-form-step-types';
import { ActionBtnState, DepositFormDetails, DepositStepParams } from '../../models/step-types';
import { DepositStepWithAction } from '../abstracts/deposit-step-with-action';

export class TradeInfoStep extends DepositStepWithAction {
  public readonly name: DepositStepName = DEPOSIT_STEP_NAME.TRADE_INFO;

  public _depositDetails: DepositFormDetails;

  constructor(depositDetails: DepositFormDetails) {
    const depositStepParams: DepositStepParams = { active: true, loading: false };
    const actionBtnState: ActionBtnState = { active: true, text: 'Translated funds is done' };
    super(depositStepParams, actionBtnState);
    this._depositDetails = depositDetails;
  }

  public doAction(): void {
    throw new Error('Method not implemented.');
  }

  public updateDepositDetails(newDepositDetails: Partial<DepositFormDetails>): void {
    this._depositDetails = { ...this._depositDetails, ...newDepositDetails };
  }
}
