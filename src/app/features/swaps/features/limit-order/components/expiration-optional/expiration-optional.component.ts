import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import {
  ExpirationOption,
  expirationOptions
} from '@features/swaps/features/limit-order/constants/expiration-options';
import { OrderExpirationService } from '@features/swaps/features/limit-order/services/order-expiration.service';

@Component({
  selector: 'app-expiration-optional',
  templateUrl: './expiration-optional.component.html',
  styleUrls: ['./expiration-optional.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpirationOptionalComponent {
  @Output() onClose = new EventEmitter<void>();

  @Output() onStateChange = new EventEmitter<void>();

  public readonly options = expirationOptions;

  constructor(private readonly orderExpirationService: OrderExpirationService) {}

  public onOptionsClick(option: ExpirationOption): void {
    this.orderExpirationService.updateExpirationTime(option.minutes);
    this.onClose.emit();
  }

  public onCustomClick(): void {
    this.onStateChange.emit();
  }
}
