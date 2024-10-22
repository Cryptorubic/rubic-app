import { BehaviorSubject, Observable } from 'rxjs';
import { CrossChainTableData } from '@features/history/models/cross-chain-table-data';
import { OnChainTableData } from '@features/history/models/on-chain-table-data';
import { inject } from '@angular/core';
import { CommonTableService } from '@features/history/services/common-table-service/common-table.service';
import { DepositTableData } from './deposit-table-data';

export abstract class TableService<Sorter, Response, Data> {
  protected readonly _size$ = new BehaviorSubject<number>(10);

  public readonly size$ = this._size$.asObservable();

  protected readonly _page$ = new BehaviorSubject<number>(0);

  public readonly page$ = this._page$.asObservable();

  protected readonly _direction$ = new BehaviorSubject<-1 | 1>(-1);

  public readonly direction$ = this._direction$.asObservable();

  protected readonly _sorter$ = new BehaviorSubject<Sorter>(this.initialSorterValue);

  public readonly sorter$ = this._sorter$.asObservable();

  public abstract readonly loading$: Observable<boolean>;

  protected abstract readonly total$: Observable<number>;

  public readonly totalPages$: Observable<number>;

  public readonly data$: Observable<Data[]>;

  private readonly commonTableService: CommonTableService = inject(CommonTableService);

  public readonly activeItemIndex$ = this.commonTableService.activeItemIndex$;

  protected constructor(private readonly initialSorterValue: Sorter) {}

  protected abstract getData(..._arguments: unknown[]): Observable<{
    data: (CrossChainTableData | OnChainTableData | DepositTableData)[];
    total: number;
  }>;

  public onDirection(direction: -1 | 1): void {
    this._direction$.next(direction);
  }

  public onSize(size: number): void {
    this._size$.next(size);
  }

  public onPage(page: number): void {
    this._page$.next(page);
  }

  public onSorting(page: Sorter): void {
    this._sorter$.next(page);
  }

  protected abstract transformResponse(response: Response): {
    data: Data[];
    total: number;
  };
}
