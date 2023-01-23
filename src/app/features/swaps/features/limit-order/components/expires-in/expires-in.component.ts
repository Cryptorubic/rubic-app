import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TimeFormControls } from '@features/swaps/features/limit-order/models/time-form';
import { LimitOrderFormService } from '@features/swaps/features/limit-order/services/limit-order-form.service';

@Component({
  selector: 'app-expires-in',
  templateUrl: './expires-in.component.html',
  styleUrls: ['./expires-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpiresInComponent {
  public readonly timeForm = new FormGroup<TimeFormControls>({
    hours: new FormControl<number>(1),
    minutes: new FormControl<number>(0)
  });

  constructor(private readonly limitOrderFormService: LimitOrderFormService) {}

  public onSet(): void {
    const form = this.timeForm.value;
    this.limitOrderFormService.updateExpirationTime(Math.min(form.hours * 60 + form.minutes, 1));
  }
}
