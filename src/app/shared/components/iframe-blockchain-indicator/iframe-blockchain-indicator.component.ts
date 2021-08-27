import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';

@Component({
  selector: 'app-iframe-blockchain-indicator',
  templateUrl: './iframe-blockchain-indicator.component.html',
  styleUrls: ['./iframe-blockchain-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IframeBlockchainIndicatorComponent {
  public blockchainInfo: IBlockchain;

  @Input() set blockchain(blockchainName: BLOCKCHAIN_NAME) {
    this.blockchainInfo = BlockchainsInfo.getBlockchainByName(blockchainName);
  }

  constructor() {}
}
