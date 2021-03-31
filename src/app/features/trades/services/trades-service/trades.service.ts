import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderBookApiService } from 'src/app/core/services/backend/order-book-api/order-book-api.service';
import { OrderBookTradeApi } from 'src/app/core/services/backend/order-book-api/types/trade-api';
import { HttpService } from 'src/app/core/services/http/http.service';
import { OrderBookCommonService } from 'src/app/core/services/order-book-common/order-book-common.service';
import { OrderBookTradeData } from 'src/app/features/order-book-trade-page/models/trade-data';

import { TokensTableService } from 'src/app/shared/models/order-book/tokens-table';

@Injectable({
  providedIn: 'root'
})
export class TradesService extends TokensTableService {
  constructor(
    private readonly httpService: HttpService,
    private readonly orderBookCommonService: OrderBookCommonService,
    private readonly orderBookApiService: OrderBookApiService
  ) {
    super();
  }

  public setTableData(value: any): void {
    this.$dataSource.next(value);
    this.$visibleTableData.next(value);
    this.$tableLoadingStatus.next(false);
  }

  public fetchSwaps(): Observable<Promise<OrderBookTradeData>[]> {
    return this.httpService.get('get_user_swap3/').pipe(
      map((swaps: OrderBookTradeApi[]) => {
        return swaps.map(async swap => {
          const tradeData = await this.orderBookApiService.tradeApiToTradeData(
            swap,
            swap.unique_link
          );
          try {
            await this.setAmountContributed(tradeData);
          } catch (err) {
            console.error(err);
          }
          return tradeData;
        });
      })
    );
  }

  public async setAmountContributed(tradeData: OrderBookTradeData): Promise<OrderBookTradeData> {
    return this.orderBookCommonService.setAmountContributed(tradeData);
  }

  public filterTable(): void {
    const filterBaseValue = this.$filterBaseValue.value?.toLowerCase();
    const filterQuoteValue = this.$filterQuoteValue.value?.toLowerCase();
    if (filterBaseValue) {
      const filteredData = this.$visibleTableData.value.filter(
        row => row.token.base.symbol.toLowerCase() === filterBaseValue
      );
      this.$visibleTableData.next(filteredData);
    }
    if (filterQuoteValue) {
      const filteredData = this.$visibleTableData.value.filter(
        row => row.token.quote.symbol.toLowerCase() === filterQuoteValue
      );
      this.$visibleTableData.next(filteredData);
    }
  }
}
