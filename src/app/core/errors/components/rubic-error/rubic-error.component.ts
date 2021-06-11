import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-rubic-error',
  templateUrl: './rubic-error.component.html',
  styleUrls: ['./rubic-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicErrorComponent {
  public text =
    'Please try again later or try using another device. If you’re still having problems, please reach out to our';

  constructor() {}
}
