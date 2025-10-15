import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AssetType } from '@app/features/trade/models/asset';
import { SelectorUtils } from '../../utils/selector-utils';
import { BlockchainItem } from '../../services/blockchains-list-service/models/available-blockchain';
import { AssetsSelectorFacadeService } from '@features/trade/components/assets-selector/services/assets-selector-facade.service';

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

  @Input({ required: true }) type: 'from' | 'to';

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

  constructor(private readonly assetsSelectorFacade: AssetsSelectorFacadeService) {}

  public isItemDisabled(item: BlockchainItem): boolean {
    if (this.isAllChains) return false;
    return this.assetsSelectorFacade.getAssetsService(this.type).isDisabled(item);
  }

  public getHintText(item: BlockchainItem): string | null {
    if (this.isAllChains) return 'Show tokens of all chains.';
    return this.assetsSelectorFacade.getAssetsService(this.type).getHintText(item);
  }

  public getBlockchainTag(item: BlockchainItem): string | null {
    if (this.isAllChains) return null;
    return SelectorUtils.getBlockchainTag(item);
  }

  public onItemClick(item: BlockchainItem): void {
    if (this.isAllChains) {
      this.assetsSelectorFacade.getAssetsService(this.type).assetListType = 'allChains';
    } else {
      this.assetsSelectorFacade.getAssetsService(this.type).assetListType = item.name;
    }
  }
}
