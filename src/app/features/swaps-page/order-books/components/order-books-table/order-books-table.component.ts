import { Component, ViewChild } from '@angular/core';
import date from 'date-and-time';
import { Observable } from 'rxjs';
import { OrderBookApiService } from 'src/app/core/services/backend/order-book-api/order-book-api.service';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { OrderBookTradeData } from 'src/app/features/order-book-trade-page/types/trade-data';
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

  @ViewChild(CoinsFilterComponent) public filter: CoinsFilterComponent;

  constructor(
    private readonly orderBooksTableService: OrderBooksTableService,
    private readonly orderBookApi: OrderBookApiService
  ) {
    this.orderBookApi.fetchPublicSwap3();
    this.$dataSource = this.orderBooksTableService.getTableData();
    this.$displayedColumns = this.orderBooksTableService.getTableColumns();
    this.$columnsSizes = this.orderBooksTableService.getTableColumnsSizes();
  }

  public getChainIcon(name: BLOCKCHAIN_NAME): string {
    return BlockchainsInfo.getBlockchainByName(name).imagePath;
  }

  public sortByDate(a: string, b: string): number {
    const date1 = new Date(date.transform(a, 'D-M-YYYY H:m', 'YYYY/MM/DD HH:mm:ss'));
    const date2 = new Date(date.transform(b, 'D-M-YYYY H:m', 'YYYY/MM/DD HH:mm:ss'));
    return date.subtract(date2, date1).toMilliseconds();
  }

  public refresnOrderBooks(): void {
    this.orderBookApi.fetchPublicSwap3();
  }
}
