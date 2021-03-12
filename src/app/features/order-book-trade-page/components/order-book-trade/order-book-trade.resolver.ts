import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TradeData } from '../../../../core/services/order-book/types';
import { Web3PublicService } from '../../../../core/services/blockchain/web3-public-service/web3-public.service';
import { OrderBookService } from '../../../../core/services/order-book/order-book.service';
import { Web3Public } from '../../../../core/services/blockchain/web3-public-service/Web3Public';

@Injectable({
  providedIn: 'root'
})
export class OrderBookTradeResolver implements Resolve<TradeData> {
  constructor(
    private orderBookService: OrderBookService,
    private web3PublicService: Web3PublicService,
    private router: Router
  ) {}

  private async getTokenData(tradeData: TradeData): Promise<void> {
    const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];

    tradeData.token = {
      base: {
        ...tradeData.token.base,
        ...(await web3Public.getTokenInfo(tradeData.token.base.address))
      },
      quote: {
        ...tradeData.token.quote,
        ...(await web3Public.getTokenInfo(tradeData.token.quote.address))
      }
    };
  }

  private async getTradeData(uniqueLink: string): Promise<TradeData> {
    const tradeData = await this.orderBookService.getTradeData(uniqueLink);
    await this.getTokenData(tradeData);

    return tradeData;
  }

  resolve(route: ActivatedRouteSnapshot): Observable<TradeData> {
    const uniqueLink = route.params.unique_link;
    return new Observable<TradeData>(observer => {
      this.getTradeData(uniqueLink)
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
