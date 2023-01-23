import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TimeFormControls } from '@features/swaps/features/limit-order/models/time-form';
import { OrderExpirationService } from '@features/swaps/features/limit-order/services/order-expiration.service';

@Component({
  selector: 'app-expiration-custom',
  templateUrl: './expiration-custom.component.html',
  styleUrls: ['./expiration-custom.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpirationCustomComponent {
  @Output() onClose = new EventEmitter<void>();

  @Output() onStateChange = new EventEmitter<void>();

  public readonly timeForm: FormGroup<TimeFormControls>;

  constructor(private readonly orderExpirationService: OrderExpirationService) {
    const expirationTime = this.orderExpirationService.expirationTime;
    this.timeForm = new FormGroup<TimeFormControls>({
      hours: new FormControl<number>(Math.floor(expirationTime / 60)),
      minutes: new FormControl<number>(expirationTime % 60)
    });
  }

  public onSet(): void {
    const form = this.timeForm.value;
    this.orderExpirationService.updateExpirationTime(Math.max(form.hours * 60 + form.minutes, 1));
    this.onClose.emit();
  }

  public onCancel(): void {
    this.onStateChange.emit();
  }

  public onHoursChange(value: number): void {
    if (value === 0 && this.timeForm.value.minutes === 0) {
      this.timeForm.controls.minutes.setValue(1);
    }
  }
}
