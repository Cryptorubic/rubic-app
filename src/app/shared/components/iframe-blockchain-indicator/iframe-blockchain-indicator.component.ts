import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { getBlockchainItem } from '@features/swaps/features/swap-form/utils/get-blockchain-item';
import { BlockchainItem } from '@features/swaps/features/swap-form/models/blockchain-item';
import { BlockchainName } from 'rubic-sdk';

@Component({
  selector: 'app-iframe-blockchain-indicator',
  templateUrl: './iframe-blockchain-indicator.component.html',
  styleUrls: ['./iframe-blockchain-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IframeBlockchainIndicatorComponent {
  @Input() set blockchain(blockchainName: BlockchainName) {
    this.blockchainItem = getBlockchainItem(blockchainName);
  }

  public blockchainItem: BlockchainItem;

  constructor() {}
}
