import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-undefined-error',
  templateUrl: './undefined-error.component.html',
  styleUrls: ['./undefined-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UndefinedErrorComponent {
  constructor() {}
}
