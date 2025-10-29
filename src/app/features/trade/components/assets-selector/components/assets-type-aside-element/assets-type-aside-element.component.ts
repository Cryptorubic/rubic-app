import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AssetListType } from '@app/features/trade/models/asset';
import { SelectorUtils } from '../../utils/selector-utils';
import { BlockchainItem } from '../../services/blockchains-list-service/models/available-blockchain';
import { temporarelyDisabledBlockchains } from '@features/trade/components/assets-selector/services/blockchains-list-service/constants/blockchains-list';
import { BlockchainsInfo } from '@cryptorubic/sdk';

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

  @Output() handleClick = new EventEmitter<BlockchainItem>();

  private get isAllChains(): boolean {
    const isBlocklchain = BlockchainsInfo.isBlockchainName(this.selectedAssetType);
    return this.blockchainItem.name === null && !isBlocklchain;
  }

  public get isSelected(): boolean {
    return this.selectedAssetType === this.blockchainItem.name || this.isAllChains;
  }

  public get isDisabled(): boolean {
    return (
      this.blockchainItem.disabledConfiguration ||
      (this.type === 'from' && this.blockchainItem.disabledFrom)
    );
  }

  public get hintText(): string | null {
    if (this.isDisabled) {
      return temporarelyDisabledBlockchains.includes(this.blockchainItem.name)
        ? 'Сoming soon'
        : 'Temporary disabled';
    }
    return null;
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
  }
}
