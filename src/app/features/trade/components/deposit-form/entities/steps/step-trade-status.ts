import { DEPOSIT_STEP_NAME, DepositStepName } from '../../models/deposit-form-step-types';
import { DepositStep } from '../abstracts/deposit-step';
import { DepositFormDetails } from '../../models/step-types';

export class TradeStatusStep extends DepositStep {
  public readonly name: DepositStepName = DEPOSIT_STEP_NAME.TRADE_INFO;

  public _depositDetails: DepositFormDetails;

  constructor(depositDetails: DepositFormDetails) {
    super({ active: false, loading: false });
    this._depositDetails = depositDetails;
  }

  public updateDepositDetails(newDepositDetails: Partial<DepositFormDetails>): void {
    this._depositDetails = { ...this._depositDetails, ...newDepositDetails };
  }
}
