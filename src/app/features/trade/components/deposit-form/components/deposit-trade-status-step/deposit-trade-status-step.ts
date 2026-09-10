import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-deposit-trade-status-step',
  standalone: false,
  templateUrl: './deposit-trade-status-step.html',
  styleUrl: './deposit-trade-status-step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositTradeStatusStep {}
