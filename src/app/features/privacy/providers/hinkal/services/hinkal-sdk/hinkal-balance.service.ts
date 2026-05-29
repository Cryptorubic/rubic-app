import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  debounceTime,
  filter,
  map,
  Observable,
  Subject,
  switchMap,
  tap
} from 'rxjs';
import { HinkalPrivateBalance } from '../../models/hinkal-private-balances';
import { HinkalWorkerService } from './hinkal-worker.service';

@Injectable()
export class HinkalBalanceService {
  constructor(private readonly workerService: HinkalWorkerService) {}

  private readonly _balances$ = new BehaviorSubject<HinkalPrivateBalance>({});

  private readonly _updateBalance$ = new Subject<void>();

  private readonly updateBalance$ = this._updateBalance$.asObservable();

  public updateBalance(): void {
    this._updateBalance$.next();
  }

  public readonly balances$ = this._balances$.asObservable();

  public initBalanceEvent(): Observable<void> {
    return this.updateBalance$.pipe(
      debounceTime(200),
      switchMap(() => {
        console.log('FETCH BALANCE');
        return this.workerService.request<void>(
          {
            type: 'updateBalance',
            params: {}
          },
          false
        );
      })
    );
  }

  public subscribeOnBalanceEvent(): Observable<number> {
    return this.workerService
      .subscribeOnEvent<{ balances: HinkalPrivateBalance; chainId: number } | null>({
        type: 'updateBalance',
        params: {}
      })
      .pipe(
        filter(Boolean),
        tap(resp => {
          console.log('BALANCE HANDLED', resp.balances);
          this._balances$.next({
            ...this._balances$.value,
            ...resp.balances
          });
        }),
        map(v => v.chainId)
      );
  }
}
