import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DepositFormDetails } from '../../../../models/deposit-form-step-types';

@Component({
  selector: 'app-deposit-details-step',
  standalone: false,
  templateUrl: './deposit-details-step.component.html',
  styleUrl: './deposit-details-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositDetailsStepComponent {
  @Input() details: DepositFormDetails;

  @Input() locked: boolean = false;
}
