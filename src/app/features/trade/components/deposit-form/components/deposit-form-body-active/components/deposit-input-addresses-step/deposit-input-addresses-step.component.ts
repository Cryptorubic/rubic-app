import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DepositFormManager } from '../../../../services/deposit-form-manager';
import { map } from 'rxjs';
import { DEPOSIT_STEP_ORDER } from '../../../../models/deposit-step-order';
import { BlockchainName } from '@cryptorubic/core';
import { DEPOSIT_FORM_STATE } from '../../../../models/deposit-form-states';
import { ActionBtnState } from '../../../../models/step-types';

@Component({
  selector: 'app-deposit-input-addresses-step',
  standalone: false,
  templateUrl: './deposit-input-addresses-step.component.html',
  styleUrl: './deposit-input-addresses-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositInputAddressesStepComponent {
  public readonly step$ = this.depositFormManager.depositFormSteps$.pipe(
    map(steps => steps[DEPOSIT_STEP_ORDER.INPUT_ADDRESSES])
  );

  public readonly srcChain: BlockchainName;

  public readonly dstChain: BlockchainName;

  constructor(private readonly depositFormManager: DepositFormManager) {
    const detailsStep =
      this.depositFormManager.depositFormSteps[DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS];
    this.srcChain = detailsStep.depositDetails.srcToken.blockchain;
    this.dstChain = detailsStep.depositDetails.dstToken.blockchain;
  }

  public doAction(): void {
    switch (this.depositFormManager.depositFormState) {
      case DEPOSIT_FORM_STATE.IDLE:
        this.depositFormManager.doAction(DEPOSIT_STEP_ORDER.INPUT_ADDRESSES, 'confirm_addresses');
        break;
      case DEPOSIT_FORM_STATE.WAITING_FOR_SENDING_DEPOSIT:
        this.depositFormManager.doAction(DEPOSIT_STEP_ORDER.INPUT_ADDRESSES, 'change_addresses');
        break;
    }
  }

  public getActionBtnState(): ActionBtnState {
    switch (this.depositFormManager.depositFormState) {
      case DEPOSIT_FORM_STATE.IDLE:
        return this.depositFormManager.getActionBtnState(
          DEPOSIT_STEP_ORDER.INPUT_ADDRESSES,
          'confirm_addresses'
        );
      case DEPOSIT_FORM_STATE.WAITING_FOR_SENDING_DEPOSIT:
        return this.depositFormManager.getActionBtnState(
          DEPOSIT_STEP_ORDER.INPUT_ADDRESSES,
          'change_addresses'
        );
      default:
        throw new Error(
          `[DepositInputAddressesStepComponent_getActionBtnState] Unsupported depositFormState ${this.depositFormManager.depositFormState}.`
        );
    }
  }
}
