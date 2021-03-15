import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderBookService } from '../../../../core/services/order-book/order-book.service';
import { OrderBookTradeData } from '../../../../core/services/order-book/types/trade-page';

@Injectable()
export class OrderBookTradeResolver implements Resolve<OrderBookTradeData> {
  constructor(private orderBookService: OrderBookService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<OrderBookTradeData> {
    const uniqueLink = route.params.unique_link;
    return new Observable<OrderBookTradeData>(observer => {
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
