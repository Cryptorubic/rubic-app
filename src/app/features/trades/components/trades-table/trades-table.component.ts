import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderBookTradeData } from 'src/app/features/order-book-trade-page/models/trade-data';
import { CoinsFilterComponent } from 'src/app/shared/components/coins-filter/coins-filter.component';
import { TradesService } from '../../services/trades-service/trades.service';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { BlockchainsInfo } from '../../../../core/services/blockchain/blockchain-info';

@Component({
  selector: 'app-trades-table',
  templateUrl: './trades-table.component.html',
  styleUrls: ['./trades-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradesTableComponent {
  public readonly $dataSource: Observable<OrderBookTradeData[]>;

  public readonly $displayedColumns: Observable<string[]>;

  public readonly $columnsSizes: Observable<string[]>;

  public readonly $tableLoading: Observable<boolean>;

  @ViewChild(CoinsFilterComponent) public filter: CoinsFilterComponent;

  constructor(private readonly tradesService: TradesService) {
    this.$tableLoading = this.tradesService.getTableLoadingStatus();
    this.tradesService.setTableLoadingStatus(true);
    this.tradesService.fetchSwaps();
    this.$dataSource = this.tradesService.getTableData();
    this.$displayedColumns = this.tradesService.getTableColumns();
    this.$columnsSizes = this.tradesService.getTableColumnsSizes();
  }

  public getChainIcon(name: BLOCKCHAIN_NAME): string {
    return BlockchainsInfo.getBlockchainByName(name).imagePath;
  }

  public refreshTable(): void {
    this.tradesService.setTableLoadingStatus(true);
    this.tradesService.fetchSwaps();
  }
}
