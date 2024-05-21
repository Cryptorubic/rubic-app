import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BlockchainFilters } from '../../components/blockchains-filter-list/models/BlockchainFilters';

@Injectable()
export class FilterQueryService {
  private readonly _filterQuery$ = new BehaviorSubject<BlockchainFilters>(undefined);

  public readonly filterQuery$ = this._filterQuery$.asObservable();

  public set filterQuery(filter: BlockchainFilters) {
    this._filterQuery$.next(filter);
  }
}
