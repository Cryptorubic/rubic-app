import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-deposit-form',
  standalone: false,
  templateUrl: './deposit-form.html',
  styleUrl: './deposit-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositForm {}
