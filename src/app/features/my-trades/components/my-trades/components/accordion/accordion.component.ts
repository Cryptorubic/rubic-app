import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { BLOCKCHAINS } from 'src/app/features/my-trades/constants/BLOCKCHAINS';
import { TRADES_PROVIDERS } from 'src/app/features/my-trades/constants/TRADES_PROVIDERS';
import { ScannerLinkPipe } from 'src/app/shared/pipes/scanner-link.pipe';
import { BehaviorSubject, Subscription } from 'rxjs';
import {
  TableRow,
  TableRowKey
} from 'src/app/features/my-trades/components/my-trades/models/TableRow';
import { MyTradesService } from 'src/app/features/my-trades/services/my-trades.service';
import { TableData } from 'src/app/features/my-trades/components/my-trades/components/table-data';
import { TRANSACTION_STATUS } from 'src/app/shared/models/blockchain/TRANSACTION_STATUS';
import { TableTrade } from 'src/app/shared/models/my-trades/TableTrade';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionComponent extends TableData implements OnInit, OnDestroy {
  @Input() tableData$: BehaviorSubject<TableRow[]>;

  public TRANSACTION_STATUS = TRANSACTION_STATUS;

  public BLOCKCHAINS = BLOCKCHAINS;

  public TRADES_PROVIDERS = TRADES_PROVIDERS;

  private PAGE_SIZE = 5;

  public page: number;

  public pagesLength: number;

  private tableData: TableRow[];

  public visibleData: TableRow[];

  public sortKey: TableRowKey = 'Date';

  public sortDirection: -1 | 1 = -1;

  private tableDataSubscription$: Subscription;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    protected readonly scannerLinkPipe: ScannerLinkPipe,
    protected readonly myTradesService: MyTradesService
  ) {
    super(myTradesService, scannerLinkPipe);
  }

  ngOnInit(): void {
    this.tableDataSubscription$ = this.tableData$
      .pipe(filter(tableData => !!tableData))
      .subscribe(tableData => {
        this.tableData = tableData?.sort(this.sortBy(this.sortKey, this.sortDirection));

        this.pagesLength = Math.ceil(this.tableData.length / this.PAGE_SIZE);
        this.goToPage(0);

        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.tableDataSubscription$.unsubscribe();
  }

  public onReceive(trade: TableTrade, event: Event): void {
    event.stopPropagation();
    this.onReceivePolygonBridgeTrade.emit(trade);
  }

  public goToPage(page: number) {
    this.page = page;
    const start = this.page * this.PAGE_SIZE;
    this.visibleData = this.tableData.slice(start, start + this.PAGE_SIZE);
  }
}
