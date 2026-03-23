import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Subscription, switchMap, tap, timer, withLatestFrom } from 'rxjs';
import { HinkalPrivateBalance } from '../../models/hinkal-private-balances';
import { HinkalWorkerService } from './hinkal-worker.service';

@Injectable()
export class HinkalBalanceService {
  constructor(private readonly workerService: HinkalWorkerService) {}

  private isPollingActive$ = new BehaviorSubject<boolean>(false);

  private readonly _balances$ = new BehaviorSubject<HinkalPrivateBalance>({});

  public stopPolling(): void {
    this.isPollingActive$.next(false);
  }

  public startPolling(): void {
    this.isPollingActive$.next(true);
  }

  public readonly balances$ = this._balances$.asObservable();

  public initBalancePolling(): Subscription {
    return timer(0, 20000)
      .pipe(
        withLatestFrom(this.isPollingActive$),
        filter(([_, isPollingActive]) => isPollingActive),
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
      )
      .subscribe();
  }

  public subscribeOnBalancePolling(): Subscription {
    return this.workerService
      .subscribeOnEvent<HinkalPrivateBalance>({
        type: 'updateBalance',
        params: {}
      })
      .pipe(tap(v => console.log('BALANCE HANDLED', v)))
      .subscribe(balances => {
        this._balances$.next({
          ...this._balances$.value,
          ...balances
        });
      });
  }
}
