import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-deposit-input-addresses-step',
  standalone: false,
  templateUrl: './deposit-input-addresses-step.html',
  styleUrl: './deposit-input-addresses-step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositInputAddressesStep {}
