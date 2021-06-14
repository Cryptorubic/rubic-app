import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-rubic-error',
  templateUrl: './rubic-error.component.html',
  styleUrls: ['./rubic-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicErrorComponent {
  constructor() {}
}
