import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-deposit-input-addresses-step',
  standalone: false,
  templateUrl: './deposit-input-addresses-step.component.html',
  styleUrl: './deposit-input-addresses-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositInputAddressesStepComponent {
  @Input() locked: boolean = false;
}
