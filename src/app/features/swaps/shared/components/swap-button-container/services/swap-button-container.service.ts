import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { filter, map } from 'rxjs/operators';
import { SwapButtonContainerErrorsService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container-errors.service';
import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';

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

  constructor(
    private readonly swapButtonContainerErrorsService: SwapButtonContainerErrorsService,
    private readonly tradeService: TradeService
  ) {
    combineLatest([this.isUpdateRateStatus$, this.swapButtonContainerErrorsService.error$])
      .pipe(filter(([isRateUpdated, error]) => !isRateUpdated && error.text && !error.loading))
      .subscribe(() => {
        this.tradeService.isButtonHovered = false;
      });
  }
}
