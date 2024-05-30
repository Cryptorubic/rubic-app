import { ChangeDetectionStrategy, Component, Inject, Injector } from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { ModalService } from '@app/core/modals/services/modal.service';
import { FilterQueryService } from '../../services/filter-query-service/filter-query.service';
import { blockchainFilters, BlockchainFilters } from './models/BlockchainFilters';
@Component({
  selector: 'app-blockchains-filter-list',
  templateUrl: './blockchains-filter-list.component.html',
  styleUrls: ['./blockchains-filter-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsFilterListComponent {
  public readonly BLOCKCHAIN_FILTERS = blockchainFilters;

  public readonly currentFilter$ = this.filterQueryService.filterQuery$;

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly filterQueryService: FilterQueryService,
    private readonly headerStore: HeaderStore,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  public onSelectFilter(filter: BlockchainFilters): void {
    this.filterQueryService.filterQuery = filter;
    // this.modalService.openMobileBlockchainList(this.injector)
  }
}
