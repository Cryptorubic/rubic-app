import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, Observable } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { OrderBookTradeTableRow } from '../../../types/trade-table';

@Injectable({
  providedIn: 'root'
})
export class OrderBooksTableService {
  private readonly $dataSource: BehaviorSubject<OrderBookTradeTableRow[]>;

  private readonly $visibleTableData: BehaviorSubject<OrderBookTradeTableRow[]>;

  private readonly $displayedColumns: BehaviorSubject<string[]>;

  private readonly $columnsSizes: BehaviorSubject<string[]>;

  private readonly $filterBaseValue: BehaviorSubject<any>;

  private readonly $filterQuoteValue: BehaviorSubject<any>;

  constructor() {
    this.$filterBaseValue = new BehaviorSubject<any>(null);
    this.$filterQuoteValue = new BehaviorSubject<any>(null);
    this.$dataSource = new BehaviorSubject<OrderBookTradeTableRow[]>([]);
    this.$visibleTableData = new BehaviorSubject<OrderBookTradeTableRow[]>([]);
    this.$displayedColumns = new BehaviorSubject<string[]>([
      'token',
      'amount',
      'network',
      'expires'
    ]);
    this.$columnsSizes = new BehaviorSubject<string[]>(['25%', '50%', '10%', '15%']);
  }

  public getTableData(): Observable<any> {
    return this.$visibleTableData.asObservable();
  }

  public setTableData(value: any): void {
    this.$dataSource.next(value);
    this.$visibleTableData.next(value);
  }

  public getTableColumns(): Observable<string[]> {
    return this.$displayedColumns.asObservable();
  }

  public getTableColumnsSizes(): Observable<string[]> {
    return this.$columnsSizes.asObservable();
  }

  public getBaseTokenFilter(): Observable<any> {
    return this.$filterBaseValue.asObservable();
  }

  public setBaseTokenFilter(value: any): void {
    this.$filterBaseValue.next(value);
  }

  public filterByToken(token: any, tokenType: 'quote' | 'base'): void {
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
}
