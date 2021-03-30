import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderBookTradeData } from 'src/app/features/order-book-trade-page/models/trade-data';
import { TokenValueType } from 'src/app/shared/models/order-book/tokens';
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

  public readonly displayedColumns: string[];

  public readonly columnsSizes: string[];

  public readonly $tableLoading: Observable<boolean>;

  constructor(private readonly tradesService: TradesService) {
    this.$tableLoading = this.tradesService.getTableLoadingStatus();
    this.tradesService.setTableLoadingStatus(true);
    this.fetchSwaps();
    this.$dataSource = this.tradesService.getTableData();
    this.displayedColumns = ['status', 'token', 'amount', 'network', 'expires'];
    this.columnsSizes = ['10%', '15%', '50%', '10%', '15%'];
  }

  public getChainIcon(name: BLOCKCHAIN_NAME): string {
    return BlockchainsInfo.getBlockchainByName(name).imagePath;
  }

  public selectToken(tokenData: TokenValueType): void {
    if (tokenData.value) {
      if (tokenData.tokenType === 'base') {
        this.tradesService.setBaseTokenFilter(tokenData.value);
      } else {
        this.tradesService.setQuoteTokenFilter(tokenData.value);
      }
    } else if (tokenData.tokenType === 'base') {
      this.tradesService.setBaseTokenFilter(null);
    } else {
      this.tradesService.setQuoteTokenFilter(null);
    }
    this.tradesService.filterTable();
  }

  public refreshTable(): void {
    this.tradesService.setTableLoadingStatus(true);
    this.fetchSwaps();
  }

  private fetchSwaps(): void {
    this.tradesService.fetchSwaps().subscribe(
      async tradeData => {
        this.tradesService.setTableData(await Promise.all(tradeData));
        this.tradesService.filterTable();
      },
      err => console.error(err),
      () => this.tradesService.setTableLoadingStatus(false)
    );
  }
}
