import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-undefined-error',
  templateUrl: './undefined-error.component.html',
  styleUrls: ['./undefined-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UndefinedErrorComponent {
  constructor() {}
}
