import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-rubic-badge',
  templateUrl: './rubic-badge.component.html',
  styleUrls: ['./rubic-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class RubicBadgeComponent {
  @Input({ required: true }) status: string;

  @Input({ required: true }) label: string;
}
