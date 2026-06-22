import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBarComponent {
  @Input() max: number = 100;

  @Input({ required: true }) value: number;
}
