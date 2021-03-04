import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { List } from 'immutable';
import { IBlockchain } from 'src/app/services/bridge/types';
import { IBlockchainShort } from './types';
import { BlockchainLabelComponent } from './blockchain-label/blockchain-label.component';
import { InputDropdownComponent } from '../input-dropdown/input-dropdown.component';
import { DropdownComponentData } from '../input-dropdown/types';

interface BlockchainLabelData {
  blockchain: IBlockchainShort;
  selected?: boolean;
}

interface BlockchainDropdownData extends DropdownComponentData {
  inputs: BlockchainLabelData;
  id: string;
  sortParameters: {
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
  @Input() selectedBlockchain: IBlockchain;

  @Input() blockchains: IBlockchain[];

  @Output() blockchainChanges = new EventEmitter<IBlockchain>();

  @ViewChild('app-input-dropdown') inputDropdown: InputDropdownComponent<BlockchainDropdownData>;

  public readonly blockchainLabelComponentClass = BlockchainLabelComponent;

  public blockchainsDropdownData = List<BlockchainDropdownData>();

  public selectedBlockchainDropdownData: BlockchainDropdownData;

  public blockchainsSortOrder = ['name', 'label'];

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
        sortParameters: { name: blockchain.name, label: blockchain.label }
      }))
    );

    if (this.selectedBlockchain) {
      this.selectedBlockchainDropdownData = {
        inputs: { blockchain: this.selectedBlockchain, selected: true },
        id: this.selectedBlockchain.name,
        sortParameters: {
          name: this.selectedBlockchain.name,
          label: this.selectedBlockchain.label
        }
      };
    } else {
      this.selectedBlockchainDropdownData = null;
    }
  }
}
