import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BridgeBlockchain } from 'src/app/features/bridge/models/BridgeBlockchain';

@Component({
  selector: 'app-blockchain-select',
  templateUrl: './blockchain-select.component.html',
  styleUrls: ['./blockchain-select.component.scss']
})
export class BlockchainSelectComponent {
  @Input() selectedBlockchain: BridgeBlockchain;

  @Input() blockchains: BridgeBlockchain[];

  @Input() disabled? = false;

  @Output() blockchainChanges = new EventEmitter<BridgeBlockchain>();

  constructor() {}

  public onBlockchainChanges(blockchainComponent) {
    this.selectedBlockchain = this.blockchains.find(
      blockchain => blockchain.name === blockchainComponent.name
    );

    this.blockchainChanges.emit(this.selectedBlockchain);
  }
}
