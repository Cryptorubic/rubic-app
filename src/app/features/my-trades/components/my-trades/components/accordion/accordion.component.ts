import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { BLOCKCHAINS } from '@features/my-trades/constants/blockchains';
import { TradesProviders } from '@features/my-trades/constants/trades-providers';
import { Observable } from 'rxjs';
import {
  TableRow,
  TableRowKeyValue
} from 'src/app/features/my-trades/components/my-trades/models/TableRow';
import { AbstractTableDataComponent } from 'src/app/features/my-trades/components/my-trades/components/abstract-table-data-component';
import { TransactionStatus } from '@shared/models/blockchain/transaction-status';
import { TableTrade } from '@shared/models/my-trades/table-trade';
import { filter, takeUntil } from 'rxjs/operators';
import { Columns } from '@features/my-trades/components/my-trades/constants/columns';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TRANSLATION_STATUS_KEY } from 'src/app/features/my-trades/components/my-trades/constants/translation-status-keys';

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class AccordionComponent extends AbstractTableDataComponent implements OnInit {
  /**
   * [REQUIRED] Table data to display.
   */
  @Input() tableData$: Observable<TableRow[]>;

  @Output() onReceivePolygonBridgeTrade = new EventEmitter<TableTrade>();

  public TRANSACTION_STATUS = TransactionStatus;

  public BLOCKCHAINS = BLOCKCHAINS;

  public TRADES_PROVIDERS = TradesProviders;

  private PAGE_SIZE = 5;

  public page: number;

  public pagesLength: number;

  private tableData: TableRow[];

  private sortedTableData: TableRow[];

  public visibleData: TableRow[];

  public isDropdownOpened = false;

  public readonly columns = Columns;

  public readonly translationStatusKeys = TRANSLATION_STATUS_KEY;

  public selectedColumn: TableRowKeyValue;

  public sortDirection: -1 | 1 = -1;

  constructor(
    injector: Injector,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: TuiDestroyService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.initData();
  }

  /**
   * Inits component data and subscriptions
   */
  private initData(): void {
    this.selectedColumn = this.columns.find(column => column.value === 'Date');
    this.page = 0;

    this.tableData$
      .pipe(
        filter(tableData => !!tableData),
        takeUntil(this.destroy$)
      )
      .subscribe(tableData => {
        this.tableData = tableData;
        this.pagesLength = Math.ceil(this.tableData.length / this.PAGE_SIZE);
        if (this.pagesLength <= this.page) {
          this.page = 0;
        }

        const waitingForReceivingTrades = this.tableData.filter(
          el => el.Status === TransactionStatus.WAITING_FOR_RECEIVING
        );
        const otherTrades = this.tableData
          .filter(el => el.Status !== TransactionStatus.WAITING_FOR_RECEIVING)
          .sort(this.sortBy('Date', -1));

        this.tableData = [...waitingForReceivingTrades, ...otherTrades];
        this.sortedTableData = this.tableData;
        this.goToPage(this.page);
      });
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

  public goToPage(page: number): void {
    this.page = page;
    const start = this.page * this.PAGE_SIZE;
    this.visibleData = this.sortedTableData.slice(start, start + this.PAGE_SIZE);

    this.cdr.detectChanges();
  }
}
