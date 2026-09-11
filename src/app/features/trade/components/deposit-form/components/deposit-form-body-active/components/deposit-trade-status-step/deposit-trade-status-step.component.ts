import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-deposit-trade-status-step',
  standalone: false,
  templateUrl: './deposit-trade-status-step.component.html',
  styleUrl: './deposit-trade-status-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositTradeStatusStepComponent {
  @Input() locked: boolean = false;
}
