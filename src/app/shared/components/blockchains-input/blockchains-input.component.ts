import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { List } from 'immutable';
import { IBlockchainShort } from './types';
import { BlockchainLabelComponent } from './blockchain-label/blockchain-label.component';
import { InputDropdownComponent } from '../input-dropdown/input-dropdown.component';
import { DropdownComponentData } from '../input-dropdown/types';
import { BridgeBlockchain } from '../../../features/bridge-page/models/BridgeBlockchain';

interface BlockchainLabelData {
  blockchain: IBlockchainShort;
  selected?: boolean;
}

interface BlockchainDropdownData extends DropdownComponentData {
  inputs: BlockchainLabelData;
  id: string;
  filterParameters: {
    name: string;
    label: string;
  };
}

@Component({
  selector: 'app-blockchains-input',
  templateUrl: './blockchains-input.component.html',
  styleUrls: ['./blockchains-input.component.scss']
})
export class BlockchainsInputComponent implements OnChanges {
  @Input() selectedBlockchain: BridgeBlockchain;

  @Input() blockchains: BridgeBlockchain[];

  @Output() blockchainChanges = new EventEmitter<BridgeBlockchain>();

  @ViewChild('app-input-dropdown') inputDropdown: InputDropdownComponent<BlockchainDropdownData>;

  public readonly blockchainLabelComponentClass = BlockchainLabelComponent;

  public blockchainsDropdownData = List<BlockchainDropdownData>();

  public selectedBlockchainDropdownData: BlockchainDropdownData;

  public blockchainsSortOrder = ['label', 'name'];

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  public readonly isSmallWidth = window.innerWidth <= 410;

  constructor() {}

  ngOnChanges() {
    this.setBlockchainsInputData();
  }

  /**
   * Takes the components selected in input-dropdown.
   * Every blockchain-component has `id`, which is actually the `name` of that blockchain.
   */
  public onBlockchainChanges(blockchainComponent) {
    this.selectedBlockchain = this.blockchains.find(
      blockchain => blockchain.name === blockchainComponent.id
    );
    this.setBlockchainsInputData();

    this.blockchainChanges.emit(this.selectedBlockchain);
  }

  /**
   * Sets blockchains' input data to pass to the input-dropdown and components' creator.
   */
  private setBlockchainsInputData() {
    this.blockchainsDropdownData = List(
      this.blockchains.map(blockchain => ({
        inputs: { blockchain },
        id: blockchain.name,
        filterParameters: { name: blockchain.name, label: blockchain.label }
      }))
    );

    if (this.selectedBlockchain) {
      this.selectedBlockchainDropdownData = {
        inputs: { blockchain: this.selectedBlockchain, selected: true },
        id: this.selectedBlockchain.name,
        filterParameters: {
          name: this.selectedBlockchain.name,
          label: this.selectedBlockchain.label
        }
      };
    } else {
      this.selectedBlockchainDropdownData = null;
    }
  }
}
