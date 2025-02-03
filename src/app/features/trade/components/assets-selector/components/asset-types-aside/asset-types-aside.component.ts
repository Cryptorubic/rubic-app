import { ChangeDetectionStrategy, Component } from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { BlockchainItem } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { BlockchainsListService } from '@features/trade/components/assets-selector/services/blockchains-list-service/blockchains-list.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { BlockchainTags } from '../blockchains-filter-list/models/BlockchainFilters';
import { FilterQueryService } from '../../services/filter-query-service/filter-query.service';
import { AssetsSelectorStateService } from '../../services/assets-selector-state/assets-selector-state.service';

@Component({
  selector: 'app-asset-types-aside',
  templateUrl: './asset-types-aside.component.html',
  styleUrls: ['./asset-types-aside.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetTypesAsideComponent {
  public readonly allChainsSelectorItem: BlockchainItem = {
    icon: 'assets/images/icons/blockchain-filters/all-chains.svg',
    name: null,
    label: 'All Chains',
    rank: 1,
    tags: [],
    disabledConfiguration: false,
    disabledFrom: false
  };

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
    private readonly queryParamsService: QueryParamsService,
    private readonly headerStore: HeaderStore,
    private readonly filterQueryService: FilterQueryService
  ) {}

  public setBlockchainFilterAll(): void {
    this.filterQueryService.filterQuery = BlockchainTags.ALL;
  }
}
