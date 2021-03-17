import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderBookTradeData } from 'src/app/shared/models/order-book/trade-page';
import { OrderBookApiService } from 'src/app/core/services/backend/order-book-api/order-book-api.service';

@Injectable()
export class OrderBookTradeResolver implements Resolve<OrderBookTradeData> {
  constructor(private orderBookApiService: OrderBookApiService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<OrderBookTradeData> {
    const uniqueLink = route.params.unique_link;
    return new Observable<OrderBookTradeData>(observer => {
      this.orderBookApiService.getTradeData(uniqueLink).subscribe(
        tradeData => {
          observer.next(tradeData);
          observer.complete();
        },
        err => {
          console.log(err);
          this.router.navigate(['/']);
        }
      );
    });
  }
}
