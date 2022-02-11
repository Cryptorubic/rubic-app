import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-deposit-card',
  templateUrl: './deposit-card.component.html',
  styleUrls: ['./deposit-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositCardComponent {
  constructor() {}
}
