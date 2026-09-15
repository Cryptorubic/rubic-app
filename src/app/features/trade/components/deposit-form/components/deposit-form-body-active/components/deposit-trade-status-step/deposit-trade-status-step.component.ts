import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DEPOSIT_STEP_ORDER } from '../../../../models/deposit-step-order';
import { map, share } from 'rxjs';
import { DepositFormManager } from '../../../../services/deposit-form-manager';

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

  constructor(private readonly depositFormManager: DepositFormManager) {}
}
