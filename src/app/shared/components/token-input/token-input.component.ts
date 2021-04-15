import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { BridgeBlockchain } from 'src/app/features/bridge-page/models/BridgeBlockchain';

@Component({
  selector: 'app-token-input',
  templateUrl: './token-input.component.html',
  styleUrls: ['./token-input.component.scss']
})
export class TokenInputComponent {
  @ViewChild(MatAutocompleteTrigger) _auto: MatAutocompleteTrigger;

  public blockchainControl = new FormControl();

  public isPanelOpen: boolean = false;

  @Input() selectedBlockchain: BridgeBlockchain;

  @Input() blockchains: BridgeBlockchain[];

  @Output() blockchainChanges = new EventEmitter<BridgeBlockchain>();

  constructor() {}

  public onBlockchainChanges(blockchainComponent) {
    this.selectedBlockchain = this.blockchains.find(
      blockchain => blockchain.name === blockchainComponent.name
    );

    this.blockchainChanges.emit(this.selectedBlockchain);
  }
}
