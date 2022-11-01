import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BlockchainName, BLOCKCHAIN_NAME } from 'rubic-sdk';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swaps-form/models/swap-provider-type';
import { SwapsService } from '@features/swaps/core/services/swaps-service/swaps.service';
import { map } from 'rxjs/operators';
import { SelectedToken } from '@features/swaps/features/swaps-form/swaps-form.component';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';

interface BlockchainItem {
  icon: string;
  label: string;
}

@Component({
  selector: 'app-swaps-header',
  templateUrl: './swaps-header.component.html',
  styleUrls: ['./swaps-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapsHeaderComponent {
  @Input() public set fromBlockchain(blockchain: BlockchainName) {
    if (blockchain) {
      this.fromBlockchainItem = this.getBlockchainItem(blockchain);
    }
  }

  @Input() public set toBlockchain(blockchain: BlockchainName) {
    if (blockchain) {
      this.toBlockchainItem = this.getBlockchainItem(blockchain);
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

  constructor(private readonly swapsService: SwapsService) {
    this.fromBlockchainItem = this.toBlockchainItem = this.getBlockchainItem(
      BLOCKCHAIN_NAME.ETHEREUM
    );
  }

  private getBlockchainItem(blockchain: BlockchainName): BlockchainItem {
    return {
      icon: blockchainIcon[blockchain],
      label: blockchainLabel[blockchain]
    };
  }
}
