import { EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { BridgeBlockchain } from 'src/app/features/bridge-page/models/BridgeBlockchain';

@Component({
  selector: 'app-token-input',
  templateUrl: './token-input.component.html',
  styleUrls: ['./token-input.component.scss']
})
export class TokenInputComponent implements OnInit {

  @ViewChild(MatAutocompleteTrigger) _auto: MatAutocompleteTrigger;
  blockchainControl = new FormControl();

  @Input() selectedBlockchain: BridgeBlockchain;

  @Input() blockchains: BridgeBlockchain[];

  @Output() blockchainChanges = new EventEmitter<BridgeBlockchain>();

  constructor() { }

  ngOnInit(): void {
    this.setValueAutocomplete();
  }

  /**
 * Takes the components selected in input-dropdown.
 * Every blockchain-component has `id`, which is actually the `name` of that blockchain.
 */
  public onBlockchainChanges(blockchainComponent) {
    this.selectedBlockchain = this.blockchains.find(
      blockchain => blockchain.name === blockchainComponent.id
    );
    this.setValueAutocomplete();

    this.blockchainChanges.emit(this.selectedBlockchain);
  }

  public getSelectedBlockchain(blockchain: BridgeBlockchain) {
    this.selectedBlockchain = blockchain;
  }

  public getOptionText(option) {
    return `${option.label} (${option.name})`;
  }

  /**
   * sets value for autocomplete
   */
  private setValueAutocomplete() {
    this.blockchainControl.setValue(this.selectedBlockchain);
  }
  
}
