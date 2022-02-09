import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositComponent {
  constructor() {}
}
