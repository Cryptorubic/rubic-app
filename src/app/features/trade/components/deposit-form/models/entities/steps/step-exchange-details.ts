import {
  DEPOSIT_STEP_NAME,
  DepositFormSteps,
  DepositStepName
} from '../../deposit-form-step-types';
import { DepositStep } from '../abstracts/deposit-step';
import { DepositFormDetails, DepositStepParams } from '../../step-types';
import { BehaviorSubject } from 'rxjs';
import { DepositFormInfo } from '../../deposit-form-info';

export class ExchangeDetailsStep extends DepositStep {
  public readonly name: DepositStepName = DEPOSIT_STEP_NAME.EXCHANGE_DETAILS;

  private _depositDetails: DepositFormDetails;

  public get depositDetails(): DepositFormDetails {
    return this._depositDetails;
  }

  constructor(
    _depositFormInfo$: BehaviorSubject<DepositFormInfo>,
    _depositFormSteps$: BehaviorSubject<DepositFormSteps>,
    depositDetails: DepositFormDetails
  ) {
    const depositStepParams: DepositStepParams = { active: true, loading: false, opened: true };
    super(depositStepParams, _depositFormInfo$, _depositFormSteps$);
    this._depositDetails = depositDetails;
  }

  public updateDepositDetails(newDepositDetails: Partial<DepositFormDetails>): void {
    this._depositDetails = { ...this._depositDetails, ...newDepositDetails };
  }
}
