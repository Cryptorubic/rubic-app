import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { REFRESH_STATUS } from '@features/trade/models/refresh-status';
import { OnRefreshData } from '@features/trade/models/on-refresh-data';

@Injectable()
export class RefreshService {
  /**
   * Stores current refresh status.
   *
   * If status was set to `IN_PROGRESS`, it cannot be set to another status,
   * until {@link stopInProgress} is not called.
   */
  private readonly _status$ = new BehaviorSubject<REFRESH_STATUS>(REFRESH_STATUS.STOPPED);

  public readonly status$ = this._status$.asObservable();

  public get status(): REFRESH_STATUS {
    return this._status$.getValue();
  }

  /**
   * Sends calls to services to start new recalculation.
   */
  private readonly _onRefresh$ = new Subject<OnRefreshData>();

  public readonly onRefresh$ = this._onRefresh$.asObservable();

  /**
   * True, if form is in recalculation.
   */
  private isRefreshing = false;

  /**
   * True, if recalculation was made by user.
   */
  private isForcedRefresh = false;

  /**
   * True, if refresh button should spin.
   */
  public readonly isRefreshRotating$ = this.status$.pipe(
    map((_status, counter) => {
      const isInitial = counter === 1;

      // const isForcedRefresh =
      //   this.isForcedRefresh || this.settingsService.instantTradeValue.autoRefresh;

      if (this.isForcedRefresh) {
        this.isForcedRefresh = false;
      }

      return isInitial /* || (isForcedRefresh && status !== REFRESH_STATUS.STOPPED) */;
    })
  );

  constructor(private readonly swapFormService: SwapsFormService) {
    this.swapFormService.isFilled$.pipe(distinctUntilChanged()).subscribe(isFilled => {
      if (!isFilled) {
        this._status$.next(REFRESH_STATUS.STOPPED);
      }
    });
  }

  /**
   * Handles user's click on refresh button.
   */
  public onButtonClick(): void {
    this._onRefresh$.next({ isForced: true });
    this.isForcedRefresh = true;
  }

  /**
   * Needs to be called, when recalculation is started.
   */
  public setRefreshing(): void {
    this.isRefreshing = true;
    if (this.status !== REFRESH_STATUS.IN_PROGRESS) {
      this._status$.next(REFRESH_STATUS.REFRESHING);
    }
  }

  /**
   * Needs to be called, when recalculation is ended.
   * Setups timer to next recalculation start.
   */
  public setStopped(): void {
    this.isRefreshing = false;
    if (this.status !== REFRESH_STATUS.IN_PROGRESS) {
      this._status$.next(REFRESH_STATUS.STOPPED);
    }
  }

  /**
   * Needs to be called, when approve/swap is started.
   */
  public startInProgress(): void {
    this._status$.next(REFRESH_STATUS.IN_PROGRESS);
  }

  /**
   * Needs to be called after user confirmed approve/swap transaction.
   */
  public stopInProgress(): void {
    if (this.isRefreshing) {
      this._status$.next(REFRESH_STATUS.REFRESHING);
    } else {
      this._status$.next(REFRESH_STATUS.STOPPED);
    }
  }
}
