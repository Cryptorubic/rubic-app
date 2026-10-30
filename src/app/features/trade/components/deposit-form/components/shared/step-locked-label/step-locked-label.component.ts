import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-step-locked-label',
  standalone: false,
  templateUrl: './step-locked-label.component.html',
  styleUrl: './step-locked-label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepLockedLabelComponent {}
