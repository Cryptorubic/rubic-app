import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { BlockchainData } from '@shared/models/blockchain/blockchain-data';

@Component({
  selector: 'app-iframe-blockchain-indicator',
  templateUrl: './iframe-blockchain-indicator.component.html',
  styleUrls: ['./iframe-blockchain-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IframeBlockchainIndicatorComponent {
  public blockchainInfo: BlockchainData;

  @Input() set blockchain(blockchainName: BLOCKCHAIN_NAME) {
    this.blockchainInfo = BlockchainsInfo.getBlockchainByName(blockchainName);
  }

  constructor() {}
}
