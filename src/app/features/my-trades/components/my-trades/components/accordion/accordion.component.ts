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
  TableRowKeyValue
} from 'src/app/features/my-trades/components/my-trades/models/TableRow';
import { MyTradesService } from 'src/app/features/my-trades/services/my-trades.service';
import { TableData } from 'src/app/features/my-trades/components/my-trades/components/table-data';
import { TRANSACTION_STATUS } from 'src/app/shared/models/blockchain/TRANSACTION_STATUS';
import { TableTrade } from 'src/app/shared/models/my-trades/TableTrade';
import { filter } from 'rxjs/operators';
import { COLUMNS } from 'src/app/features/my-trades/components/my-trades/constants/COLUMNS';
import { TRANSLATION_STATUS_KEY } from '../../constants/TRANSLATION_STATUS_KEYS';

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

  private sortedTableData: TableRow[];

  public visibleData: TableRow[];

  public isDropdownOpened = false;

  public readonly columns = COLUMNS;

  public readonly translationStatusKeys = TRANSLATION_STATUS_KEY;

  public selectedColumn: TableRowKeyValue;

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
    this.selectedColumn = this.columns.find(column => column.value === 'Date');
    this.page = 0;

    this.tableDataSubscription$ = this.tableData$
      .pipe(filter(tableData => !!tableData))
      .subscribe(tableData => {
        this.tableData = tableData;
        this.pagesLength = Math.ceil(this.tableData.length / this.PAGE_SIZE);
        if (this.pagesLength <= this.page) {
          this.page = 0;
        }
        this.sortTableData();
      });
  }

  ngOnDestroy(): void {
    this.tableDataSubscription$.unsubscribe();
  }

  public onColumnChange(column: TableRowKeyValue): void {
    this.isDropdownOpened = false;
    this.selectedColumn = column;
    this.sortTableData();
  }

  public onSortDirectionChange(): void {
    this.sortDirection *= -1;
    this.sortTableData();
  }

  private sortTableData(): void {
    this.sortedTableData = this.tableData?.sort(
      this.sortBy(this.selectedColumn.value, this.sortDirection)
    );
    this.goToPage(this.page);
  }

  public onReceive(trade: TableTrade, event: Event): void {
    event.stopPropagation();
    this.onReceivePolygonBridgeTrade.emit(trade);
  }

  public goToPage(page: number) {
    this.page = page;
    const start = this.page * this.PAGE_SIZE;
    this.visibleData = this.sortedTableData.slice(start, start + this.PAGE_SIZE);

    this.cdr.detectChanges();
  }
}
