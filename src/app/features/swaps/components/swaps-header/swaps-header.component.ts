import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BlockchainItem } from 'src/app/features/swaps/models/BlockchainItem';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { blockchainsList } from 'src/app/features/swaps/constants/BlockchainsList';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';

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
      [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: 'ccr.svg',
      [SWAP_PROVIDER_TYPE.CRYPTO_TAP]: 'ct.svg'
    };
    const defaultPath = '/assets/images/icons/swap-types/';
    this.iconUrl = defaultPath + typeIcons[swapType];
  }
}
