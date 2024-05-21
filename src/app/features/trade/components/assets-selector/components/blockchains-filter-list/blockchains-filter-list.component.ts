import { ChangeDetectionStrategy, Component } from '@angular/core';
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

  constructor(private readonly filterQueryService: FilterQueryService) {}

  public onSelectFilter(filter: BlockchainFilters): void {
    this.filterQueryService.filterQuery = filter;
  }
}
