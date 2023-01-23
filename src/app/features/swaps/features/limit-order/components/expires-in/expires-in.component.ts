import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TimeFormControls } from '@features/swaps/features/limit-order/models/time-form';

@Component({
  selector: 'app-expires-in',
  templateUrl: './expires-in.component.html',
  styleUrls: ['./expires-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpiresInComponent {
  public readonly timeForm = new FormGroup<TimeFormControls>({
    hours: new FormControl<number>(2),
    minutes: new FormControl<number>(10)
  });

  public onSet(): void {}
}
