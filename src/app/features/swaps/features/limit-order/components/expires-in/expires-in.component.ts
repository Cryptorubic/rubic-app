import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OrderExpirationService } from '@features/swaps/features/limit-order/services/order-expiration.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ExpirationValue } from '@features/swaps/features/limit-order/models/expiration-value';
import {
  getFormattedDays,
  getFormattedHours,
  getFormattedMinutes
} from '@features/swaps/features/limit-order/utils/get-formatted-time';
import { ModalService } from '@app/core/modals/services/modal.service';
import { HeaderStore } from '@app/core/header/services/header.store';

@Component({
  selector: 'app-expires-in',
  templateUrl: './expires-in.component.html',
  styleUrls: ['./expires-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpiresInComponent {
  public settingsOpen = false;

  public readonly expirationValue$: Observable<ExpirationValue> =
    this.orderExpirationService.expirationTime$.pipe(map(minutes => this.getDateValues(minutes)));

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly orderExpirationService: OrderExpirationService,
    private readonly modalService: ModalService
  ) {}

  private getDateValues(minutes: number): {
    shortValue: string;
    fullValue: string;
  } {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const values = [];
    if (days) {
      values.push(getFormattedDays(days));
    }
    if (hours % 24) {
      values.push(getFormattedHours(hours % 24));
    }
    if (minutes % 60) {
      values.push(getFormattedMinutes(minutes % 60));
    }

    return {
      shortValue: values[0],
      fullValue: values.join(' ')
    };
  }

  public onClose(): void {
    this.settingsOpen = false;
  }

  public openExpriationSettings(): void {
    this.modalService.openExpirationalSettingsModal().subscribe();
  }
}
