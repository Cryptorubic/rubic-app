import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { blockchainsList } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/constants/blockchains-list';
import { BlockchainName } from 'rubic-sdk';
import { BaseBlockchain } from '@features/facets/models/base-blockchain';

@Component({
  selector: 'app-facets-header',
  templateUrl: './facets-header.component.html',
  styleUrls: ['./facets-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FacetsHeaderComponent {
  public shownBlockchains = this.prepareBlockchains();

  @Input() selectedBlockchain: BlockchainName;

  @Output() handleBlockhainSelection = new EventEmitter<BlockchainName>();

  private prepareBlockchains(): BaseBlockchain[] {
    return blockchainsList.map(chain => ({
      name: chain.name,
      icon: blockchainIcon[chain.name],
      label: blockchainLabel[chain.name]
    }));
  }
}
