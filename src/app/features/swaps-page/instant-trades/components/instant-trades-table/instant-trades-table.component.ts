import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { InstantTradesApiService } from 'src/app/core/services/backend/instant-trades-api/instant-trades-api.service';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenValueType } from 'src/app/shared/models/order-book/tokens';
import { InstantTradesTradeData } from '../../../models/trade-data';
import { InstantTradesTableService } from './services/instant-trades-table.service';

@Component({
  selector: 'app-instant-trades-table',
  templateUrl: './instant-trades-table.component.html',
  styleUrls: ['./instant-trades-table.component.scss']
})
export class InstantTradesTableComponent implements AfterViewInit, OnInit {
  public readonly $dataSource: Observable<InstantTradesTradeData[]>;

  public readonly displayedColumns: string[];

  public readonly displayedMobileItems: string[];

  public readonly mobileSortItems: string[];

  public readonly columnsSizes: string[];

  public readonly $tableLoading: Observable<boolean>;

  public readonly $hasData: Observable<boolean>;

  constructor(
    private readonly instantTradesTableService: InstantTradesTableService,
    private readonly instantTradesApiService: InstantTradesApiService,
    private readonly tradeTypeService: TradeTypeService
  ) {
    this.$tableLoading = this.instantTradesTableService.getTableLoadingStatus();
    this.instantTradesTableService.setTableLoadingStatus(true);
    this.$dataSource = this.instantTradesTableService.getTableData();
    this.displayedColumns = ['Status', 'Network', 'From', 'To', 'Provider', 'Date'];
    this.displayedMobileItems = ['Network', 'From', 'To', 'Provider', 'Date'];
    this.mobileSortItems = ['Date', 'Status'];
    this.columnsSizes = ['15%', '9%', '23%', '23%', '15%', '15%'];
    this.$hasData = this.instantTradesTableService.hasData();
  }

  public ngAfterViewInit(): void {
    this.tradeTypeService.getBlockchain().subscribe((mode: BLOCKCHAIN_NAME) => {
      this.instantTradesTableService.setBlockchain(mode);
      this.instantTradesTableService.setFromTokenFilter(null);
      this.instantTradesTableService.setToTokenFilter(null);
      this.instantTradesTableService.filterTable();
    });
  }

  public ngOnInit(): void {
    this.fetchSwaps();
  }

  public selectToken(tokenData: TokenValueType): void {
    if (tokenData.value) {
      if (tokenData.tokenType === 'from') {
        this.instantTradesTableService.setFromTokenFilter(tokenData.value);
      } else {
        this.instantTradesTableService.setToTokenFilter(tokenData.value);
      }
    } else if (tokenData.tokenType === 'from') {
      this.instantTradesTableService.setFromTokenFilter(null);
    } else {
      this.instantTradesTableService.setToTokenFilter(null);
    }
    this.instantTradesTableService.filterTable();
  }

  public refreshInstantTrades(): void {
    this.instantTradesTableService.setTableLoadingStatus(true);
    this.fetchSwaps();
  }

  private fetchSwaps(): void {
    this.instantTradesApiService.fetchSwaps().subscribe(
      tradeData => {
        this.instantTradesTableService.setTableData(tradeData);
        this.instantTradesTableService.filterTable();
      },
      err => console.error(err),
      () => this.instantTradesTableService.setTableLoadingStatus(false)
    );
  }
}
