import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-coinbase-error',
  templateUrl: './coinbase-error.component.html',
  styleUrls: ['./coinbase-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class CoinbaseErrorComponent {}
