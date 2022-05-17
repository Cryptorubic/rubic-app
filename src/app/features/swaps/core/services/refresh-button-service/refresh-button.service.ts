import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { REFRESH_BUTTON_STATUS } from '@features/swaps/core/services/refresh-button-service/models/refresh-button-status';
import { SwapsService } from '@features/swaps/core/services/swaps-service/swaps.service';
import { distinctUntilChanged, startWith } from 'rxjs/operators';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swaps-form/models/swap-provider-type';

@Injectable()
export class RefreshButtonService {
  private _status$ = new BehaviorSubject<REFRESH_BUTTON_STATUS>(REFRESH_BUTTON_STATUS.STOP);

  public status$ = this._status$.asObservable();

  public get status(): REFRESH_BUTTON_STATUS {
    return this._status$.getValue();
  }

  private _autoRefresh$ = new BehaviorSubject<boolean>(false);

  public autoRefresh$ = this._autoRefresh$.asObservable();

  public get autoRefresh(): boolean {
    return this._autoRefresh$.getValue();
  }

  private autoRefreshingTimer: NodeJS.Timeout;

  // in seconds
  public readonly AUTO_REFRESHING_TIMEOUT = 15;

  constructor(
    private readonly swapsService: SwapsService,
    private readonly settingsService: SettingsService
  ) {
    this.subscribeOnSwapMode();
    this.subscribeOnSettings();
    this.subscribeOnStatus();
  }

  private subscribeOnSwapMode(): void {
    this.swapsService.swapMode$.pipe(distinctUntilChanged()).subscribe(() => {
      this.setAutoRefresh();
    });
  }

  private subscribeOnSettings(): void {
    combineLatest([
      this.settingsService.instantTradeValueChanges.pipe(
        startWith(this.settingsService.instantTradeValue)
      ),
      this.settingsService.crossChainRoutingValueChanges.pipe(
        startWith(this.settingsService.crossChainRoutingValue)
      )
    ])
      .pipe(
        distinctUntilChanged(
          (prev, next) =>
            prev[0].autoRefresh === next[0].autoRefresh &&
            prev[1].autoRefresh === next[1].autoRefresh
        )
      )
      .subscribe(() => {
        this.setAutoRefresh();
      });
  }

  private subscribeOnStatus(): void {
    this.status$.subscribe(status => {
      setTimeout(() => {
        if (status === REFRESH_BUTTON_STATUS.STOP) {
          this.setupAutoRefreshTimer();
        } else if (status === REFRESH_BUTTON_STATUS.REFRESHING) {
          clearTimeout(this.autoRefreshingTimer);
        }
      });
    });
  }

  private setAutoRefresh(): void {
    const swapMode = this.swapsService.swapMode;
    if (swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE) {
      this._autoRefresh$.next(this.settingsService.instantTradeValue.autoRefresh);
    } else if (swapMode === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING) {
      this._autoRefresh$.next(this.settingsService.crossChainRoutingValue.autoRefresh);
    } else {
      this._autoRefresh$.next(false);
    }

    this.setupAutoRefreshTimer();
  }

  private setupAutoRefreshTimer(): void {
    clearTimeout(this.autoRefreshingTimer);

    this._status$.next(REFRESH_BUTTON_STATUS.ON_TIMER);

    this.autoRefreshingTimer = setTimeout(() => {
      clearTimeout(this.autoRefreshingTimer);

      this._status$.next(REFRESH_BUTTON_STATUS.REFRESHING);
    }, this.AUTO_REFRESHING_TIMEOUT * 1000);
  }

  public toggleAutoRefresh(): void {
    const swapMode = this.swapsService.swapMode;
    const autoRefresh = !this.autoRefresh;
    if (swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE) {
      this.settingsService.instantTrade.patchValue({ autoRefresh });
    } else if (swapMode === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING) {
      this.settingsService.crossChainRouting.patchValue({ autoRefresh });
    }
    this._autoRefresh$.next(autoRefresh);

    this._status$.next(REFRESH_BUTTON_STATUS.REFRESHING);
  }

  public setStatus(status: REFRESH_BUTTON_STATUS): void {
    this._status$.next(status);
  }
}
