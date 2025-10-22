import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { blockchainFilters, BlockchainFilters } from './models/BlockchainFilters';
import { AssetsSelectorFacadeService } from '@features/trade/components/assets-selector/services/assets-selector-facade.service';
@Component({
  selector: 'app-blockchains-filter-list',
  templateUrl: './blockchains-filter-list.component.html',
  styleUrls: ['./blockchains-filter-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsFilterListComponent {
  public readonly BLOCKCHAIN_FILTERS = blockchainFilters;

  @Input({ required: true }) selectedFilter: BlockchainFilters;

  @Output() selectFilter = new EventEmitter<BlockchainFilters>();

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly assetsSelectorFacade: AssetsSelectorFacadeService
  ) {}

  public onSelectFilter(filter: BlockchainFilters): void {
    this.selectFilter.emit(filter);
    // this.assetsSelectorFacade.getAssetsService(this.type).filterQuery = filter;
  }
}
