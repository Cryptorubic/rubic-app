import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BlockchainFilter } from '../../components/blockchains-filter-list/models/BlockchainFilters';

@Injectable()
export class FilterQueryService {
  private readonly _filterQuery$ = new BehaviorSubject<BlockchainFilter>(undefined);

  public readonly filterQuery$ = this._filterQuery$.asObservable();

  public set filterQuery(filter: BlockchainFilter) {
    this._filterQuery$.next(filter);
  }
}
