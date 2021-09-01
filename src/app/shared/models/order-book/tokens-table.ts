import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TokenPart } from './tokens';
// @ts-ignore
// eslint-disable-next-line import/extensions
import { TradeData } from '../../components/tokens-table/models/tokens-table-data';

/* eslint-disable  @typescript-eslint/no-explicit-any */
export abstract class TokensTableService {
  protected readonly $dataSource: BehaviorSubject<TradeData[]>;

  protected readonly $visibleTableData: BehaviorSubject<TradeData[]>;

  protected readonly $filterFromValue: BehaviorSubject<any>;

  protected readonly $filterToValue: BehaviorSubject<any>;

  protected readonly $tableLoadingStatus: BehaviorSubject<boolean>;

  constructor() {
    this.$tableLoadingStatus = new BehaviorSubject<boolean>(false);
    this.$filterFromValue = new BehaviorSubject<any>(null);
    this.$filterToValue = new BehaviorSubject<any>(null);
    this.$dataSource = new BehaviorSubject<TradeData[]>([]);
    this.$visibleTableData = new BehaviorSubject<TradeData[]>([]);
  }

  public getTableData(): Observable<any> {
    return this.$visibleTableData.asObservable();
  }

  public hasData(): Observable<boolean> {
    return this.$dataSource.pipe(map(data => data.length > 0));
  }

  public setTableData(value: TradeData[]): void {
    this.$dataSource.next(value);
    this.$visibleTableData.next(value);
    this.$tableLoadingStatus.next(false);
  }

  public getFromTokenFilter(): Observable<any> {
    return this.$filterFromValue.asObservable();
  }

  public setFromTokenFilter(value: any): void {
    this.$filterFromValue.next(value);
  }

  public getToTokenFilter(): Observable<any> {
    return this.$filterToValue.asObservable();
  }

  public setToTokenFilter(value: any): void {
    this.$filterToValue.next(value);
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
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
