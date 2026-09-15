import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DepositFormManager } from '../../../../services/deposit-form-manager';
import { map, share } from 'rxjs';
import { DEPOSIT_STEP_ORDER } from '../../../../models/deposit-step-order';

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

  constructor(private readonly depositFormManager: DepositFormManager) {}
}
