import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderBookApiService } from 'src/app/core/services/backend/order-book-api/order-book-api.service';
import { OrderBookTradeData } from 'src/app/features/order-book-trade-page/models/trade-data';
import { OrderBooksTableService } from './services/order-books-table.service';

@Component({
  selector: 'app-order-books-table',
  templateUrl: './order-books-table.component.html',
  styleUrls: ['./order-books-table.component.scss']
})
export class OrderBooksTableComponent {
  public readonly $dataSource: Observable<OrderBookTradeData[]>;

  public readonly $displayedColumns: Observable<string[]>;

  public readonly $columnsSizes: Observable<string[]>;

  public readonly $tableLoading: Observable<boolean>;

  constructor(
    private readonly orderBooksTableService: OrderBooksTableService,
    private readonly orderBookApi: OrderBookApiService
  ) {
    this.$tableLoading = this.orderBooksTableService.getTableLoadingStatus();
    this.orderBooksTableService.setTableLoadingStatus(true);
    this.orderBookApi.fetchPublicSwap3();
    this.$dataSource = this.orderBooksTableService.getTableData();
    this.$displayedColumns = this.orderBooksTableService.getTableColumns();
    this.$columnsSizes = this.orderBooksTableService.getTableColumnsSizes();
  }

  public refresnOrderBooks(): void {
    this.orderBooksTableService.setTableLoadingStatus(true);
    this.orderBookApi.fetchPublicSwap3();
  }
}
