import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { TuiComparator } from '@taiga-ui/addon-table';
import {
  TableRow,
  TableRowKey
} from 'src/app/features/my-trades/components/my-trades/models/TableRow';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, share, startWith } from 'rxjs/operators';
import { isPresent } from '@taiga-ui/cdk';
import { tradesProviders } from '@shared/constants/common/trades-providers';
import { TRANSACTION_STATUS } from 'src/app/shared/models/blockchain/TRANSACTION_STATUS';
import {
  BLOCKCHAINS,
  DEPRECATED_BLOCKCHAINS
} from 'src/app/features/my-trades/constants/BLOCKCHAINS';
import { AbstractTableDataComponent } from 'src/app/features/my-trades/components/my-trades/components/abstract-table-data-component';
import { COLUMNS } from 'src/app/features/my-trades/components/my-trades/constants/COLUMNS';
import { TRANSLATION_STATUS_KEY } from '@features/my-trades/components/my-trades/constants/TRANSLATION_STATUS_KEYS';
import { TableTrade } from '@shared/models/my-trades/TableTrade';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent extends AbstractTableDataComponent implements OnInit {
  @Input() loading: boolean;

  /**
   * [REQUIRED] Table data to display.
   */
  @Input() tableData$: Observable<TableRow[]>;

  @Output() onReceivePolygonBridgeTrade = new EventEmitter<TableTrade>();

  public TRANSACTION_STATUS = TRANSACTION_STATUS;

  public BLOCKCHAINS = { ...BLOCKCHAINS, ...DEPRECATED_BLOCKCHAINS };

  public readonly tradesProviders = tradesProviders;

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

  private readonly _sorter$ = new BehaviorSubject<TuiComparator<TableRow>>(this.sorters.Date);

  public readonly sorter$ = this._sorter$.asObservable();

  public setSorter$(comparator: TuiComparator<TableRow>): void {
    this._sorter$.next(comparator);
  }

  private readonly _direction$ = new BehaviorSubject<-1 | 1>(-1);

  public readonly direction$ = this._direction$.asObservable();

  public setDirection$(direction: -1 | 1): void {
    this._direction$.next(direction);
  }

  private readonly _page$ = new Subject<number>();

  public readonly page$ = this._page$.asObservable();

  public setPage$(page: number): void {
    this._page$.next(page);
  }

  private readonly _size$ = new Subject<number>();

  public readonly size$ = this._size$.asObservable();

  public setSize$(size: number): void {
    this._size$.next(size);
  }

  private request$: Observable<readonly TableRow[]>;

  private isFirstView = true;

  public visibleData$: Observable<readonly TableRow[]>;

  public total$: Observable<number>;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  /**
   * Inits component subscriptions and observables.
   */
  private initSubscriptions(): void {
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
        .sort(this.sortBy('Date', this._direction$.getValue()));

      return [...waitingForReceivingTrades, ...otherTrades].map((user, index) =>
        index >= start && index < end ? user : null
      );
    }

    return [...tableData]
      .sort(this.sortBy(key, direction))
      .map((user, index) => (index >= start && index < end ? user : null));
  }
}
