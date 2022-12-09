import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OnramperFormCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-bottom-form-service/onramper-form-calculation.service';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';

@Injectable()
export class OnramperFormService {
  private readonly _widgetOpened$ = new BehaviorSubject<boolean>(false);

  public readonly widgetOpened$ = this._widgetOpened$.asObservable();

  public set widgetOpened(value: boolean) {
    this._widgetOpened$.next(value);
  }

  constructor(private readonly onramperFormCalculationService: OnramperFormCalculationService) {
    this.subscribeOnWidgetOpened();
  }

  private subscribeOnWidgetOpened(): void {
    this.widgetOpened$.subscribe(opened => {
      if (opened) {
        this.onramperFormCalculationService.tradeStatus = TRADE_STATUS.BUY_NATIVE_IN_PROGRESS;
      }
    });
  }
}
