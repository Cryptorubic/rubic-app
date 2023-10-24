import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-average-lock-time',
  templateUrl: './average-lock-time.component.html',
  styleUrls: ['./average-lock-time.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AverageLockTimeComponent {}
