import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { OrderBookTradeData } from 'src/app/features/order-book-trade-page/models/trade-data';
import { BLOCKCHAIN_NAME } from '../../models/blockchain/BLOCKCHAIN_NAME';
import { TokenValueType } from '../../models/order-book/tokens';
import { SortingResult } from './models/sorting-result';
import { TradeData } from './models/tokens-table-data';
import { InstantTradesTradeData } from '../../../features/swaps-page/models/trade-data';

@Component({
  selector: 'app-tokens-table',
  templateUrl: './tokens-table.component.html',
  styleUrls: ['./tokens-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensTableComponent {
  private tokensTableData: TradeData[];

  @Input() set tableData(data: TradeData[]) {
    const newData = this.prepareData(data);
    this.tokensTableData = newData;
    this.sortedTableData = newData;
  }

  @Input() public displayedMobileItems: string[];

  @Input() public mobileSortItems: string[];

  @Input() public displayedColumns: string[];

  @Input() public columnsSizes: string[];

  @Input() public tableLoading: boolean;

  @Input() public title: string;

  @Input() public hasData: boolean;

  @Input() public tableType: string;

  public get hasVisibleData(): boolean {
    return this.sortedTableData.length > 0;
  }

  @Output() public refreshTableEvent: EventEmitter<void>;

  @Output() public selectTokenEvent: EventEmitter<TokenValueType>;

  @Input() public selectedColumn: string;

  @ViewChild(MatSort) sort: MatSort;

  public sortedTableData: TradeData[];

  public $isMobile: Observable<boolean>;

  @Input() public tableSorting: Sort;

  public readonly sortableColumnNames: any;

  public readonly selectableColumns: string[];

  constructor(private readonly headerStore: HeaderStore) {
    this.refreshTableEvent = new EventEmitter<void>();
    this.selectTokenEvent = new EventEmitter<TokenValueType>();
    this.$isMobile = this.headerStore.getMobileDisplayStatus();
    this.tableSorting = { active: 'Expires in', direction: 'asc' };
    this.selectedColumn = 'Expires in';
    this.displayedMobileItems = ['From', 'To', 'Spent', 'Expected', 'Expires in'];
    this.mobileSortItems = ['From', 'To', 'Spent', 'Expected', 'Expires in'];
  }

  /**
   * @description Get class name for cell with status.
   * @param status Swap status.
   * @returns Status classname(e.g. 'tokens-table__status_active')
   */
  public getClassName(status: string): any {
    const key = `tokens-table__status_${status.toLowerCase()}`;
    const obj = {};
    obj[key] = true;
    return obj;
  }

  /**
   * @description Get chain icon by name.
   * @param name Blockhain name.
   * @returns Icon path.
   */
  public getChainIcon(name: BLOCKCHAIN_NAME): string {
    return BlockchainsInfo.getBlockchainByName(name).imagePath;
  }

  public selectColumnName(name: string): void {
    this.selectedColumn = name;
  }

  /**
   * @description Token dropdown selection event. Uses for table filtering.
   * @param data Selected token.
   */
  public selectToken(data: TokenValueType): void {
    this.selectTokenEvent.emit(data);
  }

  /**
   * @description Update table data event.
   */
  public refreshTable(): void {
    this.refreshTableEvent.emit();
  }

  /**
   * @description Sorting function for table.
   * @param sort Current sort state.
   */
  public sortData(sort: Sort): void {
    this.tableSorting = sort;
    const data = this.tokensTableData.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedTableData = data;
      return;
    }

    this.sortedTableData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'Expires in':
          return this.compareNumbers(
            (a as OrderBookTradeData).expirationDate.toDate().getTime(),
            (b as OrderBookTradeData).expirationDate.toDate().getTime(),
            isAsc
          );
        case 'network':
          return this.compareStrings(a.blockchain, b.blockchain, isAsc);
        case 'status':
          return this.compareStrings(a.status, b.status, isAsc);
        case 'Date':
          return this.compareNumbers(
            (a as InstantTradesTradeData).date.getTime(),
            (b as InstantTradesTradeData).date.getTime(),
            isAsc
          );
        case 'From':
          return this.compareNumbers(a.token.from.price, b.token.from.price, isAsc);
        case 'To':
          return this.compareNumbers(a.token.to.price, b.token.to.price, isAsc);
        default:
          return 0;
      }
    });
  }

  /**
   * Compare to numbers for sorting.
   * @param a First element to compare.
   * @param b Second element to compare.
   * @param isAsc Does current sorting state has ascending order.
   * @returns Comparing result.
   */
  private compareNumbers(a: number, b: number, isAsc: boolean): SortingResult {
    return ((a < b ? -1 : 1) * (isAsc ? 1 : -1)) as SortingResult;
  }

  /**
   * Compare to strings for sorting.
   * @param a First element to compare.
   * @param b Second element to compare.
   * @param isAsc Does current sorting state has ascending order.
   * @returns Comparing result.
   */
  private compareStrings(a: string, b: string, isAsc: boolean): SortingResult {
    return (a.localeCompare(b) * (isAsc ? 1 : -1)) as SortingResult;
  }

  /**
   * @description Convert OB trade date to tokens table data (E.G. convert expire date to duration object).
   * @param data Order book trade data.
   * @returns Converted table data.
   */
  private prepareData(data: TradeData[]): TradeData[] {
    return data.map((trade: TradeData) => ({
      ...trade,
      opened: false
    }));
  }
}
