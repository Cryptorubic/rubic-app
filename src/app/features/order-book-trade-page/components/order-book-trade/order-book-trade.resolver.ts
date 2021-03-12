import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TradeData } from '../../../../core/services/order-book/types';
import { OrderBookService } from '../../../../core/services/order-book/order-book.service';

@Injectable()
export class OrderBookTradeResolver implements Resolve<TradeData> {
  constructor(private orderBookService: OrderBookService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<TradeData> {
    const uniqueLink = route.params.unique_link;
    return new Observable<TradeData>(observer => {
      this.orderBookService
        .getTradeData(uniqueLink)
        .then(tradeData => {
          observer.next(tradeData);
          observer.complete();
        })
        .catch(err => {
          console.log(err);
          this.router.navigate(['/']);
        });
    });
  }
}
