import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BlockchainItem } from '@features/swaps/features/main-form/models/blockchain-item';
import { BLOCKCHAIN_NAME, BlockchainName } from '@shared/models/blockchain/blockchain-name';
import { BLOCKCHAINS_LIST } from '@features/swaps/features/main-form/constants/blockchains-list';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';
import { SwapsService } from '@features/swaps/core/services/swaps-service/swaps.service';
import { map } from 'rxjs/operators';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { SelectedToken } from '@features/swaps/features/main-form/components/swaps-form/swaps-form.component';

@Component({
  selector: 'app-swaps-header',
  templateUrl: './swaps-header.component.html',
  styleUrls: ['./swaps-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapsHeaderComponent {
  @Input() public set fromBlockchain(blockchain: BlockchainName) {
    if (blockchain) {
      this.fromBlockchainItem = BLOCKCHAINS_LIST.find(el => el.symbol === blockchain);
    }
  }

  @Input() public set toBlockchain(blockchain: BlockchainName) {
    if (blockchain) {
      this.toBlockchainItem = BLOCKCHAINS_LIST.find(el => el.symbol === blockchain);
    }
  }

  @Input() public set selectedToken(token: SelectedToken) {
    this.showBlockchains = Boolean(token.from && token.to);
  }

  public showBlockchains = false;

  public readonly swapType$ = this.swapsService.swapMode$.pipe(
    map(mode => {
      if (mode) {
        const swapTypeLabel = {
          [SWAP_PROVIDER_TYPE.BRIDGE]: 'Bridge',
          [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: 'Instant Trade',
          [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: 'Cross-Chain'
        };
        return swapTypeLabel[mode];
      }
    })
  );

  public fromBlockchainItem: BlockchainItem;

  public toBlockchainItem: BlockchainItem;

  public iconUrl: string;

  public tradeType: string;

  constructor(
    private readonly swapsService: SwapsService,
    private readonly swapFormService: SwapFormService
  ) {
    const ethBlockchain = BLOCKCHAINS_LIST.find(el => el.symbol === BLOCKCHAIN_NAME.ETHEREUM);
    this.fromBlockchainItem = ethBlockchain;
    this.toBlockchainItem = ethBlockchain;
  }
}
