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
import { Observable } from 'rxjs';
import {
  TableRowTrade,
  TableRowsData
} from '@features/my-trades/components/my-trades/models/table-row-trade';
import { AbstractTableDataComponent } from 'src/app/features/my-trades/components/my-trades/components/abstract-table-data-component';
import { TRANSACTION_STATUS } from '@shared/models/blockchain/transaction-status';
import { filter, takeUntil } from 'rxjs/operators';
import { COLUMNS } from '@features/my-trades/components/my-trades/constants/columns';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TRANSLATION_STATUS_KEY } from 'src/app/features/my-trades/components/my-trades/constants/translation-status-keys';
import { TRADES_PROVIDERS } from '@shared/constants/common/trades-providers';
import { PageData } from '@features/my-trades/components/my-trades/models/page-data';

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
  @Input() tableData$: Observable<TableRowsData>;

  @Output() onPageChange = new EventEmitter<PageData>();

  public TRANSACTION_STATUS = TRANSACTION_STATUS;

  public BLOCKCHAINS = BLOCKCHAINS;

  public readonly TRADES_PROVIDERS = TRADES_PROVIDERS;

  public readonly COLUMNS = COLUMNS;

  public readonly TRANSLATION_STATUS_KEY = TRANSLATION_STATUS_KEY;

  private readonly PAGE_SIZE = 10;

  private _page = 0;

  public pagesLength: number;

  public rowTrades: TableRowTrade[];

  public get index(): number {
    return this._page;
  }

  public set index(page: number) {
    this._page = page;
    this.onPageChange.emit({ page, pageSize: this.PAGE_SIZE });
  }

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
    this.tableData$
      .pipe(
        filter(tableData => !!tableData),
        takeUntil(this.destroy$)
      )
      .subscribe(tableData => {
        this.rowTrades = tableData.rowTrades;
        this.pagesLength = Math.ceil(tableData.totalCount / this.PAGE_SIZE);

        this.cdr.markForCheck();
      });
  }
}
