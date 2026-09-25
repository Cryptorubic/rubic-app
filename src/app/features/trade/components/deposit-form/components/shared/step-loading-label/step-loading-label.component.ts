import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-step-loading-label',
  standalone: false,
  templateUrl: './step-loading-label.component.html',
  styleUrl: './step-loading-label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepLoadingLabelComponent {}
