import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, Observable, switchMap, tap } from 'rxjs';
import { HinkalPrivateBalance } from '../../models/hinkal-private-balances';
import { HinkalWorkerService } from './hinkal-worker.service';

@Injectable()
export class HinkalBalanceService {
  constructor(private readonly workerService: HinkalWorkerService) {}

  private readonly _balances$ = new BehaviorSubject<HinkalPrivateBalance>({});

  private readonly _updateBalance$ = new BehaviorSubject<void>(null);

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

  public subscribeOnBalanceEvent(): Observable<HinkalPrivateBalance> {
    return this.workerService
      .subscribeOnEvent<HinkalPrivateBalance>({
        type: 'updateBalance',
        params: {}
      })
      .pipe(
        tap(balances => {
          console.log('BALANCE HANDLED', balances);
          this._balances$.next({
            ...this._balances$.value,
            ...balances
          });
        })
      );
  }
}
