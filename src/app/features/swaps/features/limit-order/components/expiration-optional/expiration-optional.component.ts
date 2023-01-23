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

  public readonly highlightedOption: number;

  constructor(private readonly orderExpirationService: OrderExpirationService) {
    const expirationTime = this.orderExpirationService.expirationTime;
    const index = this.options.findIndex(option => option.minutes === expirationTime);
    this.highlightedOption = index !== -1 ? index : this.options.length;
  }

  public onOptionsClick(option: ExpirationOption): void {
    this.orderExpirationService.updateExpirationTime(option.minutes);
    this.onClose.emit();
  }

  public onCustomClick(): void {
    this.onStateChange.emit();
  }
}
