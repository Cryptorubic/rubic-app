import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';

@Component({
  selector: 'app-iframe-blockchain-indicator',
  templateUrl: './iframe-blockchain-indicator.component.html',
  styleUrls: ['./iframe-blockchain-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IframeBlockchainIndicatorComponent {
  @Input() set blockchain(blockchainName: BlockchainName) {
    this.blockchainIcon = blockchainIcon[blockchainName];
    this.blockchainLabel = blockchainLabel[blockchainName];
  }

  public blockchainIcon: string;

  public blockchainLabel: string;
}
