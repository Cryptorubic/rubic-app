import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { BlockchainName } from 'rubic-sdk';
import { BaseBlockchain } from '@features/faucets/models/base-blockchain';

@Component({
  selector: 'app-faucets-header',
  templateUrl: './faucets-header.component.html',
  styleUrls: ['./faucets-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaucetsHeaderComponent {
  public shownBlockchains = this.prepareBlockchains([]);

  @Input() selectedBlockchain: BlockchainName;

  @Input() loading: boolean = true;

  @Input() set blockchainsList(blockchains: BlockchainName[]) {
    this.shownBlockchains = this.prepareBlockchains(blockchains);
  }

  @Output() handleBlockhainSelection = new EventEmitter<BlockchainName>();

  private prepareBlockchains(blockchains: BlockchainName[]): BaseBlockchain[] {
    return blockchains.map(chain => ({
      name: chain,
      icon: blockchainIcon[chain],
      label: blockchainLabel[chain]
    }));
  }
}
