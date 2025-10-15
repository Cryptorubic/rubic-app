import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { BlockchainItem } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { HeaderStore } from '@app/core/header/services/header.store';
import {
  BlockchainFilters,
  BlockchainTags
} from '../blockchains-filter-list/models/BlockchainFilters';
import { AssetsSelectorStateService } from '../../services/assets-selector-state/assets-selector-state.service';
import { allChainsSelectorItem } from '../../constants/all-chains';
import { AssetsSelectorFacadeService } from '@features/trade/components/assets-selector/services/assets-selector-facade.service';
import { Observable } from 'rxjs';
import { AssetListType } from '@features/trade/models/asset';

@Component({
  selector: 'app-asset-types-aside',
  templateUrl: './asset-types-aside.component.html',
  styleUrls: ['./asset-types-aside.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetTypesAsideComponent {
  @Input({ required: true }) type: 'from' | 'to';

  public readonly allChainsSelectorItem = allChainsSelectorItem;

  public get selectedAssetType$(): Observable<AssetListType> {
    return this.assetsSelectorFacade.getAssetsService(this.type).assetListType$;
  }

  public readonly isMobile = this.headerStore.isMobile;

  public readonly blockchainTags = BlockchainTags;

  public get selectedFilter$(): Observable<BlockchainFilters> {
    if (this.type) {
      return this.assetsSelectorFacade.getAssetsService(this.type).filterQuery$;
    }
  }

  public get blockchainsToShow$(): Observable<BlockchainItem[]> {
    return this.assetsSelectorFacade.getAssetsService(this.type).blockchainsToShow$;
  }

  public readonly useLargeIframe = this.queryParamsService.useLargeIframe;

  public get blockchainsAmount(): number {
    return this.assetsSelectorFacade.getAssetsService(this.type).availableBlockchains.length;
  }

  constructor(
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly queryParamsService: QueryParamsService,
    private readonly headerStore: HeaderStore,
    private readonly assetsSelectorFacade: AssetsSelectorFacadeService
  ) {}

  public setBlockchainFilterAll(): void {
    this.assetsSelectorFacade.getAssetsService(this.type).filterQuery = BlockchainTags.ALL;
  }

  public onBlockchainItemClick(item: BlockchainItem): void {
    if (item.name === null) {
      this.assetsSelectorFacade.getAssetsService(this.type).assetListType = 'allChains';
    } else {
      this.assetsSelectorFacade.getAssetsService(this.type).assetListType = item.name;
    }
  }
}
