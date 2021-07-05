import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-over-query-limit-error',
  templateUrl: './over-query-limit-error.component.html',
  styleUrls: ['./over-query-limit-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverQueryLimitErrorComponent {
  constructor() {}
}
