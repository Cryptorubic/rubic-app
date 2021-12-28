import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BlockchainItem } from '@features/swaps/models/blockchain-item';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { blockchainsList } from '@features/swaps/constants/blockchains-list';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/swap-provider-type';

@Component({
  selector: 'app-swaps-header',
  templateUrl: './swaps-header.component.html',
  styleUrls: ['./swaps-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapsHeaderComponent {
  @Input() public set fromBlockchain(blockchain: BLOCKCHAIN_NAME) {
    if (blockchain) {
      this.fromBlockchainItem = blockchainsList.find(el => el.symbol === blockchain);
    }
  }

  @Input() public set toBlockchain(blockchain: BLOCKCHAIN_NAME) {
    if (blockchain) {
      this.toBlockchainItem = blockchainsList.find(el => el.symbol === blockchain);
    }
  }

  @Input() public set swapType(type: SWAP_PROVIDER_TYPE) {
    this.getIconUrl(type);
  }

  public fromBlockchainItem: BlockchainItem;

  public toBlockchainItem: BlockchainItem;

  public iconUrl: string;

  constructor() {
    const ethBlockchain = blockchainsList.find(el => el.symbol === BLOCKCHAIN_NAME.ETHEREUM);
    this.fromBlockchainItem = ethBlockchain;
    this.toBlockchainItem = ethBlockchain;
    this.getIconUrl(SWAP_PROVIDER_TYPE.INSTANT_TRADE);
  }

  private getIconUrl(swapType: SWAP_PROVIDER_TYPE): void {
    const typeIcons: { [SWAP in SWAP_PROVIDER_TYPE]: string } = {
      [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: 'it.svg',
      [SWAP_PROVIDER_TYPE.BRIDGE]: 'bridge.svg',
      [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: 'ccr.svg'
    };
    const defaultPath = '/assets/images/icons/swap-types/';
    this.iconUrl = defaultPath + typeIcons[swapType];
  }
}
