import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { map } from 'rxjs/operators';

@Injectable()
export class SwapButtonContainerService {
  public idPrefix = '';

  private readonly _tradeStatus$ = new BehaviorSubject<TRADE_STATUS>(undefined);

  public readonly tradeStatus$ = this._tradeStatus$.asObservable();

  public get tradeStatus(): TRADE_STATUS {
    return this._tradeStatus$.getValue();
  }

  public set tradeStatus(value: TRADE_STATUS) {
    this._tradeStatus$.next(value);
  }

  public isUpdateRateStatus$ = this._tradeStatus$.pipe(
    map(status => status === TRADE_STATUS.OLD_TRADE_DATA)
  );

  constructor() {}
}
