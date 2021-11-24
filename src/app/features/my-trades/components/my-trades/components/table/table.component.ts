/* eslint-disable rxjs/no-exposed-subjects */
import { ChangeDetectionStrategy, Component, Injector, Input, OnInit } from '@angular/core';
import { TuiComparator } from '@taiga-ui/addon-table';
import {
  TableRow,
  TableRowKey
} from 'src/app/features/my-trades/components/my-trades/models/TableRow';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, share, startWith } from 'rxjs/operators';
import { isPresent } from '@taiga-ui/cdk';
import { TRADES_PROVIDERS } from 'src/app/features/my-trades/constants/TRADES_PROVIDERS';
import { TRANSACTION_STATUS } from 'src/app/shared/models/blockchain/TRANSACTION_STATUS';
import {
  BLOCKCHAINS,
  DEPRECATED_BLOCKCHAINS
} from 'src/app/features/my-trades/constants/BLOCKCHAINS';
import { AbstractTableDataComponent } from 'src/app/features/my-trades/components/my-trades/components/abstract-table-data-component';
import { COLUMNS } from 'src/app/features/my-trades/components/my-trades/constants/COLUMNS';
import { TRANSLATION_STATUS_KEY } from '@features/my-trades/components/my-trades/constants/TRANSLATION_STATUS_KEYS';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent extends AbstractTableDataComponent implements OnInit {
  @Input() loading: boolean;

  @Input() tableData$: BehaviorSubject<TableRow[]>;

  public TRANSACTION_STATUS = TRANSACTION_STATUS;

  public BLOCKCHAINS = { ...BLOCKCHAINS, ...DEPRECATED_BLOCKCHAINS };

  public TRADES_PROVIDERS = TRADES_PROVIDERS;

  public readonly columns = COLUMNS;

  public readonly translationStatusKeys = TRANSLATION_STATUS_KEY;

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

  private isFirstView = true;

  public visibleData$: Observable<readonly TableRow[]>;

  public total$: Observable<number>;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.request$ = combineLatest([
      this.sorter$.pipe(map(sorter => this.getTableRowKey(sorter, this.sorters))),
      this.direction$.pipe(
        map((dir, index) => {
          this.isFirstView = Boolean(index);
          return dir;
        })
      ),
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

    if (!this.isFirstView) {
      this.isFirstView = false;
      const waitingForReceivingTrades = tableData.filter(
        el => el.Status === TRANSACTION_STATUS.WAITING_FOR_RECEIVING
      );
      const otherTrades = tableData
        .filter(el => el.Status !== TRANSACTION_STATUS.WAITING_FOR_RECEIVING)
        .sort(this.sortBy('Date', this.direction$.getValue()));

      return [...waitingForReceivingTrades, ...otherTrades].map((user, index) =>
        index >= start && index < end ? user : null
      );
    }

    return [...tableData]
      .sort(this.sortBy(key, direction))
      .map((user, index) => (index >= start && index < end ? user : null));
  }
}
