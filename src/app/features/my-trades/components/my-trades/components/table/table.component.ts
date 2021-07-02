import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { TuiComparator } from '@taiga-ui/addon-table';
import {
  TableRow,
  TableRowKey,
  TableRowKeyValue
} from 'src/app/features/my-trades/components/my-trades/models/TableRow';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, share, startWith } from 'rxjs/operators';
import { isPresent } from '@taiga-ui/cdk';
import { ScannerLinkPipe } from 'src/app/shared/pipes/scanner-link.pipe';
import { MyTradesService } from 'src/app/features/my-trades/services/my-trades.service';
import { TRADES_PROVIDERS } from 'src/app/features/my-trades/constants/TRADES_PROVIDERS';
import { TRANSACTION_STATUS } from 'src/app/shared/models/blockchain/TRANSACTION_STATUS';
import { BLOCKCHAINS } from 'src/app/features/my-trades/constants/BLOCKCHAINS';
import { TableData } from 'src/app/features/my-trades/components/my-trades/components/table-data';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent extends TableData implements OnInit {
  @Input() loading: boolean;

  @Input() tableData$: BehaviorSubject<TableRow[]>;

  public TRANSACTION_STATUS = TRANSACTION_STATUS;

  public BLOCKCHAINS = BLOCKCHAINS;

  public TRADES_PROVIDERS = TRADES_PROVIDERS;

  public readonly columns: TableRowKeyValue[] = [
    {
      translateKey: 'tradesTable.columns.status',
      value: 'Status'
    },
    {
      translateKey: 'tradesTable.columns.from',
      value: 'FromTo'
    },
    {
      translateKey: 'tradesTable.columns.provider',
      value: 'Provider'
    },
    {
      translateKey: 'tradesTable.columns.send',
      value: 'Sent'
    },
    {
      translateKey: 'tradesTable.columns.expected',
      value: 'Expected'
    },
    {
      translateKey: 'tradesTable.columns.date',
      value: 'Date'
    }
  ];

  public readonly sorters: Record<TableRowKey, TuiComparator<TableRow>> = {
    Status: () => 0,
    FromTo: () => 0,
    Provider: () => 0,
    Sent: () => 0,
    Expected: () => 0,
    Date: () => 0
  };

  public readonly sorter$ = new BehaviorSubject<TuiComparator<TableRow>>(this.sorters.Date);

  public readonly direction$ = new BehaviorSubject<-1 | 1>(-1);

  public readonly page$ = new Subject<number>();

  public readonly size$ = new Subject<number>();

  private request$: Observable<readonly TableRow[]>;

  public visibleData$: Observable<readonly TableRow[]>;

  public total$: Observable<number>;

  constructor(
    protected readonly myTradesService: MyTradesService,
    protected readonly scannerLinkPipe: ScannerLinkPipe
  ) {
    super(myTradesService, scannerLinkPipe);
  }

  ngOnInit(): void {
    this.request$ = combineLatest([
      this.sorter$.pipe(map(sorter => this.getTableRowKey(sorter, this.sorters))),
      this.direction$,
      this.page$.pipe(startWith(0)),
      this.size$.pipe(startWith(10)),
      this.tableData$.pipe(filter(isPresent))
    ]).pipe(
      // zero time debounce for a case when both key and direction change
      debounceTime(0),
      map(query => query && this.getData(...query)),
      share()
    );

    this.visibleData$ = this.request$.pipe(
      filter(isPresent),
      map(visibleTableData => visibleTableData.filter(isPresent)),
      startWith([])
    );

    this.total$ = this.request$.pipe(
      filter(isPresent),
      map(({ length }) => length),
      startWith(1)
    );
  }

  private getTableRowKey(
    sorter: TuiComparator<TableRow>,
    dictionary: Record<TableRowKey, TuiComparator<TableRow>>
  ): TableRowKey {
    const pair = Object.entries(dictionary).find(
      (item): item is [TableRowKey, TuiComparator<TableRow>] => item[1] === sorter
    );
    return pair ? pair[0] : 'Date';
  }

  private getData(
    key: TableRowKey,
    direction: -1 | 1,
    page: number,
    size: number,
    tableData: TableRow[]
  ): ReadonlyArray<TableRow | null> {
    const start = page * size;
    const end = start + size;
    return [...tableData]
      .sort(this.sortBy(key, direction))
      .map((user, index) => (index >= start && index < end ? user : null));
  }
}
