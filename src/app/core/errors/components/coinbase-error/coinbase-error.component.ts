import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-coinbase-error',
  templateUrl: './coinbase-error.component.html',
  styleUrls: ['./coinbase-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoinbaseErrorComponent {}
