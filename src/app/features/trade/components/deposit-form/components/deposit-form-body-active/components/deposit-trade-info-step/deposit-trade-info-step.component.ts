import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DepositFormManager } from '../../../../services/deposit-form-manager';
import { map, share } from 'rxjs';
import { DEPOSIT_STEP_ORDER } from '../../../../models/deposit-step-order';

@Component({
  selector: 'app-deposit-trade-info-step',
  standalone: false,
  templateUrl: './deposit-trade-info-step.component.html',
  styleUrl: './deposit-trade-info-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositTradeInfoStepComponent {
  public readonly step$ = this.depositFormManager.depositFormSteps$.pipe(
    map(steps => steps[DEPOSIT_STEP_ORDER.TRADE_INFO]),
    share()
  );

  constructor(private readonly depositFormManager: DepositFormManager) {}
}
