import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-ledger-error',
  standalone: false,
  templateUrl: './ledger-error.component.html',
  styleUrl: './ledger-error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LedgerErrorComponent {}
