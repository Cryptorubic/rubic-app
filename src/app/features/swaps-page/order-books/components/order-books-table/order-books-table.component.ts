import { AfterViewInit, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderBookApiService } from 'src/app/core/services/backend/order-book-api/order-book-api.service';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';
import { OrderBookTradeData } from 'src/app/features/order-book-trade-page/models/trade-data';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenValueType } from 'src/app/shared/models/order-book/tokens';
import { OrderBooksTableService } from './services/order-books-table.service';

@Component({
  selector: 'app-order-books-table',
  templateUrl: './order-books-table.component.html',
  styleUrls: ['./order-books-table.component.scss']
})
export class OrderBooksTableComponent implements AfterViewInit {
  public readonly $dataSource: Observable<OrderBookTradeData[]>;

  public readonly displayedColumns: string[];

  public readonly columnsSizes: string[];

  public readonly $tableLoading: Observable<boolean>;

  public $hasData: Observable<boolean>;

  constructor(
    private readonly orderBooksTableService: OrderBooksTableService,
    private readonly orderBookApi: OrderBookApiService,
    private readonly tradeTypeService: TradeTypeService
  ) {
    this.$tableLoading = this.orderBooksTableService.getTableLoadingStatus();
    this.orderBooksTableService.setTableLoadingStatus(true);
    this.fetchPublicSwaps();
    this.$dataSource = this.orderBooksTableService.getTableData();
    this.displayedColumns = ['Tokens', 'Amount', 'Network', 'Expires in'];
    this.columnsSizes = ['25%', '50%', '10%', '15%'];
    this.$hasData = this.orderBooksTableService.hasData();
  }

  public ngAfterViewInit(): void {
    this.tradeTypeService.getBlockchain().subscribe((mode: BLOCKCHAIN_NAME) => {
      this.orderBooksTableService.setBlockchain(mode);
      this.orderBooksTableService.setBaseTokenFilter(null);
      this.orderBooksTableService.setQuoteTokenFilter(null);
      this.orderBooksTableService.filterTable();
      this.$hasData = this.orderBooksTableService.hasData();
    });
  }

  public selectToken(tokenData: TokenValueType): void {
    if (tokenData.value) {
      if (tokenData.tokenType === 'base') {
        this.orderBooksTableService.setBaseTokenFilter(tokenData.value);
      } else {
        this.orderBooksTableService.setQuoteTokenFilter(tokenData.value);
      }
    } else if (tokenData.tokenType === 'base') {
      this.orderBooksTableService.setBaseTokenFilter(null);
    } else {
      this.orderBooksTableService.setQuoteTokenFilter(null);
    }
    this.orderBooksTableService.filterTable();
  }

  public refreshOrderBooks(): void {
    this.orderBooksTableService.setTableLoadingStatus(true);
    this.fetchPublicSwaps();
  }

  private fetchPublicSwaps(): void {
    this.orderBookApi.fetchPublicSwaps().subscribe(
      async tradeData => {
        this.orderBooksTableService.setTableData(await Promise.all(tradeData));
        this.orderBooksTableService.filterTable();
      },
      err => console.error(err),
      () => this.orderBooksTableService.setTableLoadingStatus(false)
    );
  }
}
