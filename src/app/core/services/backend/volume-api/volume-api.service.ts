import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { HttpService } from 'src/app/core/services/http/http.service';
import { map, pluck, switchMap } from 'rxjs/operators';
import { TradeVolume } from '@core/services/backend/volume-api/models/trade-volume';
import { TradeVolumeRequest } from '@core/services/backend/volume-api/models/trade-volume-request';
import { BigNumber } from 'bignumber.js';
import { LpReward } from './models/lp-rewards';

@Injectable({
  providedIn: 'root'
})
export class VolumeApiService {
  private tradeVolume$: BehaviorSubject<TradeVolume>;

  /**
   * Returns trading volumes data as observable
   * @return Trade volumes.
   */
  public get tradingVolume$(): Observable<TradeVolume> {
    return this.tradeVolume$.asObservable();
  }

  constructor(private httpService: HttpService) {
    this.tradeVolume$ = new BehaviorSubject(undefined);
    this.setTradeVolumeInterval();
  }

  /**
   * Makes request for trade volumes with interval and updates data volume.
   */
  private setTradeVolumeInterval(): void {
    timer(0, 1000 * 60 * 60)
      .pipe(switchMap(() => this.fetchVolume()))
      .subscribe(volume => this.tradeVolume$.next(volume));
  }

  /**
   * Makes request for trade volumes.
   * @return Observable trade volume.
   */
  private fetchVolume(): Observable<TradeVolume> {
    return this.httpService.get('total_values/').pipe(
      map((volume: TradeVolumeRequest) => ({
        instantTrades: new BigNumber(volume.instant_trades_amount),
        bridges: new BigNumber(volume.bridges_amount)
      }))
    );
  }

  /**
   * Makes request for liquidity providing rewards.
   * @return Observable LpReward[].
   */
  public fetchLpRewards(): Observable<LpReward[]> {
    return this.httpService
      .get<{ rewardsByDays: LpReward[] }>('total_values/stats/lp-rewards')
      .pipe(pluck('rewardsByDays'));
  }
}
