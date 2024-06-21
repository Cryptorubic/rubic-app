import { Inject, Injectable, Injector } from '@angular/core';
import { ModalService } from '@app/core/modals/services/modal.service';
import { GasFormService } from '@app/features/trade/services/gas-form/gas-form.service';
import { BehaviorSubject } from 'rxjs';
import {
  BlockchainFilters,
  BlockchainTags
} from '../../components/blockchains-filter-list/models/BlockchainFilters';

@Injectable()
export class FilterQueryService {
  private readonly _filterQuery$ = new BehaviorSubject<BlockchainFilters>('All');

  public readonly filterQuery$ = this._filterQuery$.asObservable();

  constructor(
    private readonly gasFormService: GasFormService,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  public set filterQuery(filter: BlockchainFilters) {
    if (filter === this._filterQuery$.getValue() && filter !== BlockchainTags.ALL) {
      this._filterQuery$.next(BlockchainTags.ALL);
      this.gasFormService.updateFilterQuery(BlockchainTags.ALL);
    } else {
      this._filterQuery$.next(filter);
      this.gasFormService.updateFilterQuery(filter);
      this.modalService.openMobileBlockchainList(this.injector);
    }
  }
}
