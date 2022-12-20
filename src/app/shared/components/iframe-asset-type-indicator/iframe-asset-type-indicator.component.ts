import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { getBlockchainItem } from '@features/swaps/features/swap-form/utils/get-blockchain-item';
import { AssetTypeItem } from '@features/swaps/features/swap-form/models/asset-type-item';
import { AssetType } from '@features/swaps/shared/models/form/asset';

@Component({
  selector: 'app-iframe-asset-type-indicator',
  templateUrl: './iframe-asset-type-indicator.component.html',
  styleUrls: ['./iframe-asset-type-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IframeAssetTypeIndicatorComponent {
  @Input() set assetType(assetType: AssetType) {
    if (assetType === 'fiat') {
      this.assetTypeItem = {
        icon: 'assets/images/icons/fiat-selector.svg',
        label: 'fiat'
      };
    } else {
      this.assetTypeItem = getBlockchainItem(assetType);
    }
  }

  public assetTypeItem: AssetTypeItem;

  constructor() {}
}
