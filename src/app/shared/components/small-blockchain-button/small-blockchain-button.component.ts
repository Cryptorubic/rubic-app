import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BlockchainItem } from '@app/features/trade/components/assets-selector/services/blockchains-list-service/models/available-blockchain';
import { AssetListType } from '@features/trade/models/asset';

@Component({
  selector: 'app-small-blockchain-button',
  templateUrl: './small-blockchain-button.component.html',
  styleUrls: ['./small-blockchain-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmallBlockchainButtonComponent {
  @Input({ required: true }) blockchainItem: BlockchainItem;

  @Input({ required: true }) selectedAssetType: AssetListType;
}
