import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-deposit-trade-info-step',
  standalone: false,
  templateUrl: './deposit-trade-info-step.component.html',
  styleUrl: './deposit-trade-info-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositTradeInfoStepComponent {
  @Input() locked: boolean = false;
}
