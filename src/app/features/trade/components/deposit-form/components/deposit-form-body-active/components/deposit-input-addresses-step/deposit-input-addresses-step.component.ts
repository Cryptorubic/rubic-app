import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DepositFormManager } from '../../../../services/injectable/deposit-form-manager';
import { map, share, startWith, switchMap } from 'rxjs';
import { DEPOSIT_STEP_ORDER } from '../../../../models/deposit-step-order';
import { BlockchainName } from '@cryptorubic/core';
import { DEPOSIT_FORM_STATE } from '../../../../models/deposit-form-states';
import { ActionBtnState } from '../../../../models/step-types';
import { BLOCKCHAINS } from '@app/shared/constants/blockchain/ui-blockchains';

@Component({
  selector: 'app-deposit-input-addresses-step',
  standalone: false,
  templateUrl: './deposit-input-addresses-step.component.html',
  styleUrl: './deposit-input-addresses-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositInputAddressesStepComponent {
  public readonly step$ = this.depositFormManager.depositFormSteps$.pipe(
    map(steps => steps[DEPOSIT_STEP_ORDER.INPUT_ADDRESSES]),
    share()
  );

  public readonly isStepHighlighted$ = this.depositFormManager.depositFormState$.pipe(
    map(state => state === DEPOSIT_FORM_STATE.INPUT_ADDRESSES)
  );

  public readonly showRefundInput$ = this.depositFormManager.depositFormState$.pipe(
    switchMap(() => this.step$),
    map(step => step.isRefundAddressRequired()),
    startWith(false)
  );

  public readonly actionBtnState$ = this.step$.pipe(map(() => this.getActionBtnState()));

  public readonly srcChain: BlockchainName;

  public readonly dstChain: BlockchainName;

  public readonly srcChainUI: string;

  public readonly dstChainUI: string;

  constructor(private readonly depositFormManager: DepositFormManager) {
    const detailsStep =
      this.depositFormManager.depositFormSteps[DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS];
    this.srcChain = detailsStep.depositDetails.srcToken.blockchain;
    this.dstChain = detailsStep.depositDetails.dstToken.blockchain;
    this.srcChainUI = BLOCKCHAINS[this.srcChain].name;
    this.dstChainUI = BLOCKCHAINS[this.dstChain].name;
  }

  public doAction(): void {
    switch (this.depositFormManager.depositFormState) {
      case DEPOSIT_FORM_STATE.INPUT_ADDRESSES:
      case DEPOSIT_FORM_STATE.IDLE:
        this.depositFormManager.doAction(DEPOSIT_STEP_ORDER.INPUT_ADDRESSES, 'confirm_addresses');
        break;
      default:
        this.depositFormManager.doAction(DEPOSIT_STEP_ORDER.INPUT_ADDRESSES, 'change_addresses');
        break;
    }
  }

  public getActionBtnState(): ActionBtnState {
    switch (this.depositFormManager.depositFormState) {
      case DEPOSIT_FORM_STATE.INPUT_ADDRESSES:
      case DEPOSIT_FORM_STATE.IDLE:
        return this.depositFormManager.getActionBtnState(
          DEPOSIT_STEP_ORDER.INPUT_ADDRESSES,
          'confirm_addresses'
        );
      default:
        return this.depositFormManager.getActionBtnState(
          DEPOSIT_STEP_ORDER.INPUT_ADDRESSES,
          'change_addresses'
        );
    }
  }
}
