import { Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderBookApiService } from 'src/app/core/services/backend/order-book-api/order-book-api.service';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { OrderBookTradeData } from 'src/app/features/order-book-trade-page/models/trade-data';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { CoinsFilterComponent } from '../../../../../shared/components/coins-filter/coins-filter.component';
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

  @ViewChild(CoinsFilterComponent) public filter: CoinsFilterComponent;

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

  public getChainIcon(name: BLOCKCHAIN_NAME): string {
    return BlockchainsInfo.getBlockchainByName(name).imagePath;
  }

  public refresnOrderBooks(): void {
    this.orderBooksTableService.setTableLoadingStatus(true);
    this.orderBookApi.fetchPublicSwap3();
  }
}
