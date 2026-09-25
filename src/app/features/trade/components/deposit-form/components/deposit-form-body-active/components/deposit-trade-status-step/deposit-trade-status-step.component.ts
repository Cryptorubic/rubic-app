import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DEPOSIT_STEP_ORDER } from '../../../../models/deposit-step-order';
import { map, share } from 'rxjs';
import { DepositFormManager } from '../../../../services/deposit-form-manager';
import { DEPOSIT_FORM_STATE } from '../../../../models/deposit-form-states';

@Component({
  selector: 'app-deposit-trade-status-step',
  standalone: false,
  templateUrl: './deposit-trade-status-step.component.html',
  styleUrl: './deposit-trade-status-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositTradeStatusStepComponent {
  public readonly step$ = this.depositFormManager.depositFormSteps$.pipe(
    map(steps => steps[DEPOSIT_STEP_ORDER.TRADE_STATUS]),
    share()
  );

  public readonly isStepHighlighted$ = this.depositFormManager.depositFormState$.pipe(
    map(state => state === DEPOSIT_FORM_STATE.STATUS_TRACKING)
  );

  constructor(private readonly depositFormManager: DepositFormManager) {}
}
