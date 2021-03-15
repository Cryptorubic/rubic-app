import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OrderBookTradeForm } from 'src/app/core/services/order-book/types/trade-form';
import { OrderBookFormToken } from 'src/app/core/services/order-book/types/tokens';

@Injectable()
export class OrderBooksFormService {
  private readonly _tradeForm = new BehaviorSubject<OrderBookTradeForm>({
    token: {
      base: {} as OrderBookFormToken,
      quote: {} as OrderBookFormToken
    }
  } as OrderBookTradeForm);

  constructor() {}

  public getTradeForm(): Observable<OrderBookTradeForm> {
    return this._tradeForm.asObservable();
  }

  public setTradeForm(tradeForm: OrderBookTradeForm): void {
    return this._tradeForm.next(tradeForm);
  }
}
