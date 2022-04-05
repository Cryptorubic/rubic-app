import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BlockchainItem } from '@features/swaps/models/blockchain-item';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { BLOCKCHAINS_LIST } from '@features/swaps/constants/blockchains-list';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/swap-provider-type';
import { SwapsService } from '@features/swaps/services/swaps-service/swaps.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-swaps-header',
  templateUrl: './swaps-header.component.html',
  styleUrls: ['./swaps-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapsHeaderComponent {
  @Input() public set fromBlockchain(blockchain: BLOCKCHAIN_NAME) {
    if (blockchain) {
      this.fromBlockchainItem = BLOCKCHAINS_LIST.find(el => el.symbol === blockchain);
    }
  }

  @Input() public set toBlockchain(blockchain: BLOCKCHAIN_NAME) {
    if (blockchain) {
      this.toBlockchainItem = BLOCKCHAINS_LIST.find(el => el.symbol === blockchain);
    }
  }

  public readonly swapType$ = this.swapsService.swapMode$.pipe(
    map(mode => {
      const swapTypeLabel = {
        [SWAP_PROVIDER_TYPE.BRIDGE]: 'Bridge',
        [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: 'Instant Trade',
        [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: 'Multichain'
      };
      if (mode) {
        return swapTypeLabel[mode];
      }
    })
  );

  public fromBlockchainItem: BlockchainItem;

  public toBlockchainItem: BlockchainItem;

  public iconUrl: string;

  public tradeType: string;

  constructor(private readonly swapsService: SwapsService) {
    const ethBlockchain = BLOCKCHAINS_LIST.find(el => el.symbol === BLOCKCHAIN_NAME.ETHEREUM);
    this.fromBlockchainItem = ethBlockchain;
    this.toBlockchainItem = ethBlockchain;
  }
}
