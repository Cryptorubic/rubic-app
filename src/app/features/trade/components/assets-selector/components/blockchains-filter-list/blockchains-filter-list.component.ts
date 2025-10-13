import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { blockchainFilters, BlockchainFilters } from './models/BlockchainFilters';
import { AssetsSelectorFacadeService } from '@features/trade/components/assets-selector/services/assets-selector-facade.service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-blockchains-filter-list',
  templateUrl: './blockchains-filter-list.component.html',
  styleUrls: ['./blockchains-filter-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockchainsFilterListComponent {
  public readonly BLOCKCHAIN_FILTERS = blockchainFilters;

  public get currentFilter$(): Observable<BlockchainFilters> {
    return this.assetsSelectorFacade.getAssetsService(this.type).filterQuery$;
  }

  public readonly isMobile = this.headerStore.isMobile;

  @Input({ required: true }) type: 'from' | 'to';

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly assetsSelectorFacade: AssetsSelectorFacadeService
  ) {}

  public onSelectFilter(filter: BlockchainFilters): void {
    this.assetsSelectorFacade.getAssetsService(this.type).filterQuery = filter;
  }
}
