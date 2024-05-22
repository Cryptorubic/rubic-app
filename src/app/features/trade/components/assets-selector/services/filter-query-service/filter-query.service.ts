import { Injectable } from '@angular/core';
import { GasFormService } from '@app/features/trade/services/gas-form/gas-form.service';
import { BehaviorSubject } from 'rxjs';
import { BlockchainFilters } from '../../components/blockchains-filter-list/models/BlockchainFilters';

@Injectable()
export class FilterQueryService {
  private readonly _filterQuery$ = new BehaviorSubject<BlockchainFilters>(undefined);

  public readonly filterQuery$ = this._filterQuery$.asObservable();

  constructor(private readonly gasFormService: GasFormService) {}

  public set filterQuery(filter: BlockchainFilters) {
    this._filterQuery$.next(filter);
    this.gasFormService.updateFilterQuery(filter);
  }
}
