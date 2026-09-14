import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DEPOSIT_STEP_NAME, DepositStepName } from '../../models/deposit-form-step-types';
import {
  ActionBtnState,
  DepositFormDetails,
  DepositStepParams,
  InputAddressesStepForm
} from '../../models/step-types';
import { isWalletAddressCorrect } from '@app/features/privacy/providers/clearswap/constants/receiver-validator';
import { DepositStepWithAction } from '../abstracts/deposit-step-with-action';

export class InputAddressesStep extends DepositStepWithAction {
  public readonly name: DepositStepName = DEPOSIT_STEP_NAME.INPUT_ADDRESSES;

  public inputsForm = new FormGroup<InputAddressesStepForm>({
    receiverAddr: new FormControl('', [Validators.required]),
    refundAddr: new FormControl('', [Validators.required])
  });

  constructor(private readonly depositDetails: DepositFormDetails) {
    const depositStepParams: DepositStepParams = { active: true, loading: false };
    const actionBtnState: ActionBtnState = { active: true, text: 'Confirm Addresses' };
    super(depositStepParams, actionBtnState);
    this.initValidators();
  }

  public doAction(): void {
    throw new Error('Method not implemented.');
  }

  private initValidators(): void {
    this.inputsForm.controls.receiverAddr.setAsyncValidators([
      isWalletAddressCorrect(this.depositDetails.dstToken.blockchain)
    ]);
    this.inputsForm.controls.refundAddr.setAsyncValidators([
      isWalletAddressCorrect(this.depositDetails.srcToken.blockchain)
    ]);
  }
}
