import { ChangeDetectionStrategy, Component } from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { BlockchainItem } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { BlockchainsListService } from '@features/trade/components/assets-selector/services/blockchains-list-service/blockchains-list.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { BlockchainTags } from '../blockchains-filter-list/models/BlockchainFilters';
import { FilterQueryService } from '../../services/filter-query-service/filter-query.service';
import { AssetsSelectorStateService } from '../../services/assets-selector-state/assets-selector-state.service';
import { AssetsSelectorService } from '../../services/assets-selector-service/assets-selector.service';
import { allChainsSelectorItem } from '../../constants/all-chains';

@Component({
  selector: 'app-asset-types-aside',
  templateUrl: './asset-types-aside.component.html',
  styleUrls: ['./asset-types-aside.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetTypesAsideComponent {
  public readonly allChainsSelectorItem = allChainsSelectorItem;

  public readonly selectedAssetType$ = this.assetsSelectorStateService.assetType$;

  public readonly formType = this.assetsSelectorStateService.formType;

  public readonly isMobile = this.headerStore.isMobile;

  public readonly blockchainTags = BlockchainTags;

  public readonly selectedFilter$ = this.filterQueryService.filterQuery$;

  public readonly blockchainsToShow$ = this.blockchainsListService.assetsBlockchainsToShow$;

  public readonly useLargeIframe = this.queryParamsService.useLargeIframe;

  public get blockchainsAmount(): number {
    return this.blockchainsListService.availableBlockchains.length;
  }

  constructor(
    private readonly blockchainsListService: BlockchainsListService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly queryParamsService: QueryParamsService,
    private readonly headerStore: HeaderStore,
    private readonly filterQueryService: FilterQueryService
  ) {}

  public setBlockchainFilterAll(): void {
    this.filterQueryService.filterQuery = BlockchainTags.ALL;
  }

  public onBlockchainItemClick(item: BlockchainItem): void {
    if (item.name === null) {
      if (this.assetsSelectorStateService.assetType === 'allChains') return;
      this.assetsSelectorService.onAllChainsSelect();
    } else {
      if (this.assetsSelectorStateService.assetType === item.name) return;
      this.assetsSelectorService.onBlockchainSelect(item.name);
    }
  }
}
