import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-success-swap-info',
  templateUrl: './success-swap-info.component.html',
  styleUrls: ['./success-swap-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessSwapInfoComponent {
  @Input({ required: true }) showPoints: boolean;

  constructor() {}
}
