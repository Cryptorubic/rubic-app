import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { REFRESH_STATUS } from '@features/swaps/core/services/refresh-service/models/refresh-status';
import { OnRefreshData } from '@features/swaps/core/services/refresh-service/models/on-refresh-data';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RefreshService {
  private readonly _status$ = new BehaviorSubject<REFRESH_STATUS>(REFRESH_STATUS.STOPPED);

  public readonly status$ = this._status$.asObservable();

  public get status(): REFRESH_STATUS {
    return this._status$.getValue();
  }

  private readonly _onRefresh$ = new Subject<OnRefreshData>();

  public readonly onRefresh$ = this._onRefresh$.asObservable();

  /**
   * Refresh timeout in milliseconds.
   */
  private readonly timeout = 30_000;

  private timeoutId: NodeJS.Timeout;

  constructor(private readonly swapFormService: SwapFormService) {
    this.swapFormService.isFilled$.pipe(distinctUntilChanged()).subscribe(isFilled => {
      if (!isFilled) {
        this._status$.next(REFRESH_STATUS.STOPPED);
        clearTimeout(this.timeoutId);
      }
    });
  }

  public onButtonClick(): void {
    this._onRefresh$.next({ isForced: true });
  }

  public setRefreshing(): void {
    this._status$.next(REFRESH_STATUS.REFRESHING);
  }

  public setInProgress(): void {
    this._status$.next(REFRESH_STATUS.IN_PROGRESS);
  }

  public setStopped(): void {
    this._status$.next(REFRESH_STATUS.STOPPED);
    this.setupTimer();
  }

  private setupTimer(): void {
    this.timeoutId = setTimeout(() => {
      clearTimeout(this.timeoutId);

      this._onRefresh$.next({ isForced: false });
    }, this.timeout);
  }
}
