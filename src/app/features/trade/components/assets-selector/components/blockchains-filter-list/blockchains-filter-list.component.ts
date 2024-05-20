import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FilterQueryService } from '../../services/filter-query-service/filter-query.service';
import { BlockchainFilter, BlockchainFilters } from './models/BlockchainFilters';
@Component({
  selector: 'app-blockchains-filter-list',
  templateUrl: './blockchains-filter-list.component.html',
  styleUrls: ['./blockchains-filter-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsFilterListComponent {
  public readonly BLOCKCHAIN_FILTERS = Object.values(BlockchainFilters);

  private readonly filterQueryService = inject(FilterQueryService);

  public selectedFilterIndex: number | null = null;

  public onSelectFilter(filter: BlockchainFilter, index: number): void {
    this.selectedFilterIndex = index;
    this.filterQueryService.filterQuery = filter;
  }

  isSelectedFilter(index: number): boolean {
    return this.selectedFilterIndex === index;
  }
}
