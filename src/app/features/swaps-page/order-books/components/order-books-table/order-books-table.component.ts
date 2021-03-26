import { AfterViewInit, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderBookApiService } from 'src/app/core/services/backend/order-book-api/order-book-api.service';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';
import { OrderBookTradeData } from 'src/app/features/order-book-trade-page/models/trade-data';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { OrderBooksTableService } from './services/order-books-table.service';

@Component({
  selector: 'app-order-books-table',
  templateUrl: './order-books-table.component.html',
  styleUrls: ['./order-books-table.component.scss']
})
export class OrderBooksTableComponent implements AfterViewInit {
  public readonly $dataSource: Observable<OrderBookTradeData[]>;

  public readonly $displayedColumns: Observable<string[]>;

  public readonly $columnsSizes: Observable<string[]>;

  public readonly $tableLoading: Observable<boolean>;

  constructor(
    private readonly orderBooksTableService: OrderBooksTableService,
    private readonly orderBookApi: OrderBookApiService,
    private readonly tradeTypeService: TradeTypeService
  ) {
    this.$tableLoading = this.orderBooksTableService.getTableLoadingStatus();
    this.orderBooksTableService.setTableLoadingStatus(true);
    this.orderBookApi.fetchPublicSwaps();
    this.$dataSource = this.orderBooksTableService.getTableData();
    this.$displayedColumns = this.orderBooksTableService.getTableColumns();
    this.$columnsSizes = this.orderBooksTableService.getTableColumnsSizes();
  }

  public ngAfterViewInit(): void {
    this.tradeTypeService.getBlockchain().subscribe((mode: BLOCKCHAIN_NAME) => {
      this.orderBooksTableService.setBlockchain(mode);
      this.orderBooksTableService.filterByBlockchain();
    });
  }

  public refreshOrderBooks(): void {
    this.orderBooksTableService.setTableLoadingStatus(true);
    this.orderBookApi.fetchPublicSwaps();
  }
}
