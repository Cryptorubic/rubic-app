import {
  DEPOSIT_STEP_NAME,
  DepositFormSteps,
  DepositStepName
} from '../../deposit-form-step-types';
import {
  ActionBtnState,
  DEPOSIT_FLOW,
  DepositFlow,
  DepositFormDetails,
  DepositStepParams
} from '../../step-types';
import { BehaviorSubject } from 'rxjs';
import { DEPOSIT_FORM_STATE, DepositFormState } from '../../deposit-form-states';
import { DepositStepWithAction } from '../abstracts/deposit-step-with-action';
import { ExchangeDetailsStepAction } from '../../deposit-form-step-actions';

export class ExchangeDetailsStep extends DepositStepWithAction<ExchangeDetailsStepAction> {
  public readonly name: DepositStepName = DEPOSIT_STEP_NAME.EXCHANGE_DETAILS;

  private _depositFlow: DepositFlow = DEPOSIT_FLOW.MANUAL;

  public get depositFlow(): DepositFlow {
    return this._depositFlow;
  }

  private _depositDetails: DepositFormDetails;

  public get depositDetails(): DepositFormDetails {
    return this._depositDetails;
  }

  constructor(
    depositStepParams: DepositStepParams,
    actionButtonsMap: Record<ExchangeDetailsStepAction, ActionBtnState>,
    _depositFormState$: BehaviorSubject<DepositFormState>,
    _depositFormSteps$: BehaviorSubject<DepositFormSteps>,
    depositDetails: DepositFormDetails
  ) {
    super(depositStepParams, _depositFormState$, _depositFormSteps$, actionButtonsMap);

    this._depositDetails = depositDetails;
  }

  public doAction(action: ExchangeDetailsStepAction): Promise<void> {
    if (action === 'select_manual_flow') {
      this._depositFlow = DEPOSIT_FLOW.MANUAL;
      this._depositFormState$.next(DEPOSIT_FORM_STATE.WAITING_FOR_SENDING_DEPOSIT);
    } else {
      this._depositFlow = DEPOSIT_FLOW.TX;
      this._depositFormState$.next(DEPOSIT_FORM_STATE.WAITING_FOR_SIGNING_TRANSFER);
    }
    return Promise.resolve();
  }

  public updateDepositDetails(newDepositDetails: Partial<DepositFormDetails>): void {
    this._depositDetails = { ...this._depositDetails, ...newDepositDetails };
  }
}
