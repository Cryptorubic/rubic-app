import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderBooksTableService {
  private readonly $dataSource: BehaviorSubject<any>;

  private readonly $displayedColumns: BehaviorSubject<string[]>;

  private readonly $columnsSizes: BehaviorSubject<string[]>;

  constructor() {
    this.$dataSource = new BehaviorSubject<any>([
      {
        token: { from: 'ETH', to: 'RBC' },
        amount: { from: 0.22507, to: 1318.19286206 },
        network: 'ETH',
        expires: ' 1д: 4ч: 55м '
      },
      {
        token: { from: 'ETH', to: 'RBC' },
        amount: { from: 0.0658, to: 370 },
        network: 'ETH',
        expires: ' 1д: 4ч: 55м '
      }
    ]);
    this.$displayedColumns = new BehaviorSubject<string[]>([
      'token',
      'amount',
      'network',
      'expires'
    ]);
    this.$columnsSizes = new BehaviorSubject<string[]>(['25%', '50%', '10%', '15%']);
  }

  public getTableData(): Observable<any> {
    return this.$dataSource.asObservable();
  }

  public getTableColumns(): Observable<string[]> {
    return this.$displayedColumns.asObservable();
  }

  public getTableColumnsSizes(): Observable<string[]> {
    return this.$columnsSizes.asObservable();
  }


}
