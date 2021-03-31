import { BehaviorSubject, Observable } from 'rxjs';
import { OrderBookTradeTableRow } from 'src/app/features/swaps-page/order-books/models/trade-table';
import { TokenPart } from './tokens';

export abstract class TokensTableService {
  protected readonly $dataSource: BehaviorSubject<OrderBookTradeTableRow[]>;

  protected readonly $visibleTableData: BehaviorSubject<OrderBookTradeTableRow[]>;

  protected readonly $filterBaseValue: BehaviorSubject<any>;

  protected readonly $filterQuoteValue: BehaviorSubject<any>;

  protected readonly $tableLoadingStatus: BehaviorSubject<boolean>;

  constructor() {
    this.$tableLoadingStatus = new BehaviorSubject<boolean>(false);
    this.$filterBaseValue = new BehaviorSubject<any>(null);
    this.$filterQuoteValue = new BehaviorSubject<any>(null);
    this.$dataSource = new BehaviorSubject<OrderBookTradeTableRow[]>([]);
    this.$visibleTableData = new BehaviorSubject<OrderBookTradeTableRow[]>([]);
  }

  public getTableData(): Observable<any> {
    return this.$visibleTableData.asObservable();
  }

  public setTableData(value: any): void {
    this.$dataSource.next(value);
    this.$visibleTableData.next(value);
    this.$tableLoadingStatus.next(false);
  }

  public getBaseTokenFilter(): Observable<any> {
    return this.$filterBaseValue.asObservable();
  }

  public setBaseTokenFilter(value: any): void {
    this.$filterBaseValue.next(value);
  }

  public getQuoteTokenFilter(): Observable<any> {
    return this.$filterQuoteValue.asObservable();
  }

  public setQuoteTokenFilter(value: any): void {
    this.$filterQuoteValue.next(value);
  }

  public filterByToken(token: any, tokenType: TokenPart): void {
    const filterValue = token.option.value.toLowerCase();
    if (filterValue.length < 2) {
      this.$visibleTableData.next(this.$dataSource.value);
    } else {
      const filteredData = this.$dataSource.value.filter(
        row => row.token[tokenType].symbol.toLowerCase() === filterValue
      );
      this.$visibleTableData.next(filteredData);
    }
  }

  public setTableLoadingStatus(value: boolean): void {
    this.$tableLoadingStatus.next(value);
  }

  public getTableLoadingStatus(): Observable<boolean> {
    return this.$tableLoadingStatus.asObservable();
  }
}
