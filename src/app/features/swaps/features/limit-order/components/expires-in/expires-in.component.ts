import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OrderExpirationService } from '@features/swaps/features/limit-order/services/order-expiration.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-expires-in',
  templateUrl: './expires-in.component.html',
  styleUrls: ['./expires-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpiresInComponent {
  public dropdownState: 'optional' | 'custom' = 'optional';

  public settingsOpen = false;

  public readonly expirationValue$ = this.orderExpirationService.expirationTime$.pipe(
    map(minutes => {
      // console.log(minutes);
      if (minutes === 1) {
        return `1 minute`;
      }
      if (minutes < 60) {
        return `${minutes} minutes`;
      }

      const hours = Math.floor(minutes / 60);
      if (hours === 1) {
        return `1 hour`;
      }
      if (hours < 24) {
        return `${hours} hours`;
      }

      const days = Math.floor(hours / 24);
      if (days === 1) {
        return `1 day`;
      }
      return `${days} days`;
    })
  );

  constructor(private readonly orderExpirationService: OrderExpirationService) {}

  public onClose(): void {
    this.settingsOpen = false;
  }

  public toggleState(): void {
    this.dropdownState = this.dropdownState === 'optional' ? 'custom' : 'optional';
  }
}
