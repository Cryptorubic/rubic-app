import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AssetsSelectorService } from '../../services/assets-selector-service/assets-selector.service';
import { AssetType } from '@app/features/trade/models/asset';
import { BlockchainsListService } from '../../services/blockchains-list-service/blockchains-list.service';
import { SelectorUtils } from '../../utils/selector-utils';
import { BlockchainItem } from '../../services/blockchains-list-service/models/available-blockchain';

@Component({
  selector: 'app-assets-type-aside-element',
  templateUrl: './assets-type-aside-element.component.html',
  styleUrls: ['./assets-type-aside-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetsTypeAsideElementComponent {
  @Input({ required: true }) blockchainItem: BlockchainItem;

  @Input({ required: true }) selectedAssetType: AssetType;

  @Input({ required: true }) isMobile: boolean = false;

  private get isAllChains(): boolean {
    return this.blockchainItem.name === null;
  }

  public get isSelected(): boolean {
    return (
      this.selectedAssetType === this.blockchainItem.name ||
      (this.isAllChains && this.selectedAssetType === 'allChains')
    );
  }

  public get id(): string {
    return !this.isAllChains ? `idPrefixNetwork_${this.blockchainItem.name}` : 'allChainsSelector';
  }

  constructor(
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly blockchainsListService: BlockchainsListService
  ) {}

  public isItemDisabled(item: BlockchainItem): boolean {
    if (this.isAllChains) return false;
    return this.blockchainsListService.isDisabled(item);
  }

  public getHintText(item: BlockchainItem): string | null {
    if (this.isAllChains) return 'Show tokens of all chains.';
    return this.blockchainsListService.getHintText(item);
  }

  public getBlockchainTag(item: BlockchainItem): string | null {
    if (this.isAllChains) return null;
    return SelectorUtils.getBlockchainTag(item);
  }

  public onItemClick(item: BlockchainItem): void {
    if (this.isAllChains) {
      if (this.selectedAssetType === 'allChains') return;
      this.assetsSelectorService.onAllChainsSelect();
    } else {
      if (this.selectedAssetType === item.name) return;
      this.assetsSelectorService.onBlockchainSelect(item.name);
    }
  }
}
