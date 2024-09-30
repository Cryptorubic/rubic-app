import { ChangeDetectionStrategy, Component, Inject, Injector, Input } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { ModalService } from '@app/core/modals/services/modal.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { AvailableBlockchain } from '@features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { BlockchainsListService } from '@features/trade/components/assets-selector/services/blockchains-list-service/blockchains-list.service';
import { AssetsSelectorService } from '@features/trade/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { BlockchainTags } from '../blockchains-filter-list/models/BlockchainFilters';
import { FilterQueryService } from '../../services/filter-query-service/filter-query.service';
import { SelectorUtils } from '@features/trade/components/assets-selector/utils/selector-utils';

@Component({
  selector: 'app-asset-types-aside',
  templateUrl: './asset-types-aside.component.html',
  styleUrls: ['./asset-types-aside.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetTypesAsideComponent {
  @Input() idPrefix: string;

  public readonly selectedAssetType$ = this.assetsSelectorService.assetType$;

  public readonly formType = this.assetsSelectorService.formType;

  public readonly isMobile = this.headerStore.isMobile;

  public readonly blockchainTags = BlockchainTags;

  public readonly selectedFilter$ = this.filterQueryService.filterQuery$;

  public readonly blockchainsToShow$ = this.blockchainsListService.assetsBlockchainsToShow$;

  public get blockchainsAmount(): number {
    return this.blockchainsListService.availableBlockchains.length;
  }

  public get showFiats(): boolean {
    return this.formType === 'from' && !this.queryParamsService.hideUnusedUI;
  }

  constructor(
    private readonly blockchainsListService: BlockchainsListService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly swapFormService: SwapsFormService,
    private readonly queryParamsService: QueryParamsService,
    private readonly modalService: ModalService,
    private readonly headerStore: HeaderStore,
    private readonly filterQueryService: FilterQueryService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  public getBlockchainTag(blockchain: AvailableBlockchain): string {
    return SelectorUtils.getBlockchainTag(blockchain);
  }

  public setBlockchainFilterAll(): void {
    this.filterQueryService.setFilterQuery(BlockchainTags.ALL);
  }

  public isBlockchainDisabled(blockchain: AvailableBlockchain): boolean {
    return this.blockchainsListService.isDisabled(blockchain);
  }

  public getBlockchainHintText(blockchain: AvailableBlockchain): string | null {
    return this.blockchainsListService.getHintText(blockchain);
  }

  public onBlockchainSelect(blockchainName: BlockchainName): void {
    this.assetsSelectorService.onBlockchainSelect(blockchainName);
  }

  public openFiatsList(): void {
    this.assetsSelectorService.openFiatsList();
  }

  public toggleBlockchainList(): void {
    this.modalService.openMobileBlockchainList(this.injector);
  }
}
