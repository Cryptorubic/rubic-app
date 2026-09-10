import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-deposit-details-step',
  standalone: false,
  templateUrl: './deposit-details-step.html',
  styleUrl: './deposit-details-step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositDetailsStep {}
