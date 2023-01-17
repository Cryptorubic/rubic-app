import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LimitOrder } from '@core/services/limit-orders/models/limit-order';
import { LimitOrdersApiService } from '@core/services/limit-orders/limit-orders-api.service';
import { AuthService } from '@core/services/auth/auth.service';

@Injectable()
export class LimitOrdersStoreService {
  private readonly _orders$ = new BehaviorSubject<LimitOrder[]>([]);

  public readonly orders$ = this._orders$.asObservable();

  private readonly _loading$ = new BehaviorSubject(false);

  public readonly loading$ = this._loading$.asObservable();

  /**
   * Set to true by default and after orders list was changed.
   * Set to false after update.
   * @private
   */
  private dirtyState = true;

  constructor(
    private readonly ordersApiService: LimitOrdersApiService,
    private readonly authService: AuthService
  ) {}

  public async shouldUpdateOrders(): Promise<void> {
    if (this.dirtyState) {
      await this.updateOrders();
    }
  }

  private async updateOrders(): Promise<void> {
    const walletAddress = this.authService.userAddress;
    if (!walletAddress) {
      return;
    }

    this._loading$.next(true);
    this._orders$.next(await this.ordersApiService.getUserOrders(walletAddress));
    this._loading$.next(false);
    this.dirtyState = false;
  }
}
