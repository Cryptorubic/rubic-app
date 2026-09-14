import { DEPOSIT_STEP_NAME, DepositStepName } from '../../models/deposit-form-step-types';
import { DepositStep } from '../abstracts/deposit-step';
import { DepositFormDetails } from '../../models/step-types';

export class ExchangeDetailsStep extends DepositStep {
  public readonly name: DepositStepName = DEPOSIT_STEP_NAME.EXCHANGE_DETAILS;

  public _depositDetails: DepositFormDetails;

  constructor(depositDetails: DepositFormDetails) {
    super({ active: true, loading: false });
    this._depositDetails = depositDetails;
  }

  public updateDepositDetails(newDepositDetails: Partial<DepositFormDetails>): void {
    this._depositDetails = { ...this._depositDetails, ...newDepositDetails };
  }
}
