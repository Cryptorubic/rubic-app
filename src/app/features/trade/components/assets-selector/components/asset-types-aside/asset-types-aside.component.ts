import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { BlockchainItem } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { HeaderStore } from '@app/core/header/services/header.store';
import {
  BlockchainFilters,
  BlockchainTags
} from '../blockchains-filter-list/models/BlockchainFilters';
import { allChainsSelectorItem } from '../../constants/all-chains';
import { AssetListType } from '@features/trade/models/asset';

@Component({
  selector: 'app-asset-types-aside',
  templateUrl: './asset-types-aside.component.html',
  styleUrls: ['./asset-types-aside.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetTypesAsideComponent {
  @Input({ required: true }) type: 'from' | 'to';

  @Input({ required: true }) totalBlockchains: number;

  @Input({ required: true }) searchQuery: string;

  @Input({ required: true }) blockchainsToShow: BlockchainItem[];

  @Input({ required: true }) blockchainFilter: BlockchainFilters;

  @Input({ required: true }) assetListType: AssetListType;

  @Output() handleBlockchainSelect = new EventEmitter<BlockchainItem>();

  @Output() handleFilterSelect = new EventEmitter<BlockchainFilters>();

  @Output() onSearchQuery = new EventEmitter<string>();

  public readonly allChainsSelectorItem = allChainsSelectorItem;

  public readonly isMobile = this.headerStore.isMobile;

  public readonly useLargeIframe = this.queryParamsService.useLargeIframe;

  constructor(
    private readonly queryParamsService: QueryParamsService,
    private readonly headerStore: HeaderStore
  ) {}

  public setBlockchainFilterAll(): void {
    this.handleFilterSelect.emit(BlockchainTags.ALL);
  }

  public onBlockchainItemClick(item: BlockchainItem): void {
    this.handleBlockchainSelect.emit(item);
  }
}
