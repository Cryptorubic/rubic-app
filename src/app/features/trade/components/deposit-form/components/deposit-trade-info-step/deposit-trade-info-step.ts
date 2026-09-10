import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-deposit-trade-info-step',
  standalone: false,
  templateUrl: './deposit-trade-info-step.html',
  styleUrl: './deposit-trade-info-step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositTradeInfoStep {}
