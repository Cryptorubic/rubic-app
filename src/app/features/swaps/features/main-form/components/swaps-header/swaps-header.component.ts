import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BlockchainName, BLOCKCHAIN_NAME } from 'rubic-sdk';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';
import { SwapsService } from '@features/swaps/core/services/swaps-service/swaps.service';
import { map } from 'rxjs/operators';
import { SelectedToken } from '@features/swaps/features/main-form/components/swaps-form/swaps-form.component';
import networks, { Network } from '@shared/constants/blockchain/networks';

@Component({
  selector: 'app-swaps-header',
  templateUrl: './swaps-header.component.html',
  styleUrls: ['./swaps-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapsHeaderComponent {
  @Input() public set fromBlockchain(blockchain: BlockchainName) {
    if (blockchain) {
      this.fromBlockchainItem = networks.find(el => el.name === blockchain);
    }
  }

  @Input() public set toBlockchain(blockchain: BlockchainName) {
    if (blockchain) {
      this.toBlockchainItem = networks.find(el => el.name === blockchain);
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
          [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: 'Instant Trade',
          [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: 'Cross-Chain'
        };
        return swapTypeLabel[mode];
      }
    })
  );

  public fromBlockchainItem: Network;

  public toBlockchainItem: Network;

  public OnChainTradeType: string;

  constructor(private readonly swapsService: SwapsService) {
    const ethBlockchain = networks.find(el => el.name === BLOCKCHAIN_NAME.ETHEREUM);
    this.fromBlockchainItem = ethBlockchain;
    this.toBlockchainItem = ethBlockchain;
  }
}
