import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressComponent {
  @Input() size: number;

  @Input() label: string;

  @Input() value: number;

  @Input() loading: boolean = true;

  @Input() needLogin: boolean = false;
}
