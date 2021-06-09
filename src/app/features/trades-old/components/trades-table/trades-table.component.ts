import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderBookTradeData } from 'src/app/features/order-book-trade-page-old/models/trade-data';
import { TokenValueType } from 'src/app/shared/models/order-book/tokens';
import * as moment from 'moment';
import { map } from 'rxjs/operators';
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

  public readonly $hasData: Observable<boolean>;

  constructor(private readonly tradesService: TradesService) {
    this.$tableLoading = this.tradesService.getTableLoadingStatus();
    this.tradesService.setTableLoadingStatus(true);
    this.fetchSwaps();
    this.$dataSource = this.tradesService.getTableData().pipe(
      map(trades =>
        trades.map(trade => ({
          ...trade,
          expiresIn: moment.duration(trade.expirationDate.diff(moment().utc()))
        }))
      )
    );
    this.displayedColumns = ['Status', 'Tokens', 'Amount', 'Network', 'Expires in'];
    this.columnsSizes = ['10%', '15%', '50%', '10%', '15%'];
    this.$hasData = this.tradesService.hasData();
  }

  public getChainIcon(name: BLOCKCHAIN_NAME): string {
    return BlockchainsInfo.getBlockchainByName(name).imagePath;
  }

  public selectToken(tokenData: TokenValueType): void {
    if (tokenData.value) {
      if (tokenData.tokenType === 'from') {
        this.tradesService.setFromTokenFilter(tokenData.value);
      } else {
        this.tradesService.setToTokenFilter(tokenData.value);
      }
    } else if (tokenData.tokenType === 'from') {
      this.tradesService.setFromTokenFilter(null);
    } else {
      this.tradesService.setToTokenFilter(null);
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
