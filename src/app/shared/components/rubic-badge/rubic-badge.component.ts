import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TuiStatus } from '@taiga-ui/kit';

@Component({
  selector: 'app-rubic-badge',
  templateUrl: './rubic-badge.component.html',
  styleUrls: ['./rubic-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicBadgeComponent {
  @Input({ required: true }) status: TuiStatus;

  @Input({ required: true }) label: string;
}
