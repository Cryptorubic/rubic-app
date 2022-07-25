import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositComponent {
  @Input() nftId: string;

  @Input() brbc: string;

  @Input() rewards: string;

  @Input() apy: string;

  @Input() endDate: string;

  constructor() {}
}
