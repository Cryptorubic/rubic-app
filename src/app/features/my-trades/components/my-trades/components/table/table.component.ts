import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  Output
} from '@angular/core';
import { TableRowsData } from '@features/my-trades/components/my-trades/models/table-row-trade';
import { Observable } from 'rxjs';
import { TRANSACTION_STATUS } from '@shared/models/blockchain/transaction-status';
import { BLOCKCHAINS, DEPRECATED_BLOCKCHAINS } from '@features/my-trades/constants/blockchains';
import { AbstractTableDataComponent } from 'src/app/features/my-trades/components/my-trades/components/abstract-table-data-component';
import { COLUMNS } from '@features/my-trades/components/my-trades/constants/columns';
import { TRANSLATION_STATUS_KEY } from '@features/my-trades/components/my-trades/constants/translation-status-keys';
import { TRADES_PROVIDERS } from '@shared/constants/common/trades-providers';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent extends AbstractTableDataComponent {
  @Input() loading: boolean;

  /**
   * [REQUIRED] Table data to display.
   */
  @Input() tableData$: Observable<TableRowsData>;

  @Output() onPageChange = new EventEmitter<number>();

  public TRANSACTION_STATUS = TRANSACTION_STATUS;

  public BLOCKCHAINS = { ...BLOCKCHAINS, ...DEPRECATED_BLOCKCHAINS };

  public readonly TRADES_PROVIDERS = TRADES_PROVIDERS;

  public readonly COLUMNS = COLUMNS;

  public readonly TRANSLATION_STATUS_KEY = TRANSLATION_STATUS_KEY;

  private _page = 0;

  public get page(): number {
    return this._page;
  }

  public set page(page: number) {
    this._page = page;
    this.onPageChange.emit(this._page);
  }

  constructor(injector: Injector) {
    super(injector);
  }
}
