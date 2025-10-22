import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AssetListType } from '@app/features/trade/models/asset';
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

  @Input({ required: true }) selectedAssetType: AssetListType;

  @Input({ required: true }) isMobile: boolean = false;

  @Input({ required: true }) type: 'from' | 'to';

  @Input({ required: true }) isDisabled: boolean;

  @Input({ required: true }) hintText: string;

  @Output() handleClick = new EventEmitter<BlockchainItem>();

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

  constructor() {}

  public getBlockchainTag(item: BlockchainItem): string | null {
    if (this.isAllChains) return null;
    return SelectorUtils.getBlockchainTag(item);
  }

  public onItemClick(item: BlockchainItem): void {
    this.handleClick.emit(item);
    // @TODO TOKENS
    // if (this.isAllChains) {
    //   this.assetsSelectorFacade.getAssetsService(this.type).assetListType = 'allChains';
    // } else {
    //   this.assetsSelectorFacade.getAssetsService(this.type).assetListType = item.name;
    // }
  }
}
