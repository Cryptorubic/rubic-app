import {Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild} from '@angular/core';
import {IBlockchain, IBlockchains} from "../../services/bridge/types";
import {List} from "immutable";
import {IBlockchainShort} from "./types";
import {BlockchainLabelComponent} from "./blockchain-label/blockchain-label.component";
import {InputDropdownComponent} from "../input-dropdown/input-dropdown.component";

interface BlockchainLabelData {
  blockchain: IBlockchainShort;
  selected?: boolean;
}

interface BlockchainDropdownData {
  inputs: BlockchainLabelData;
  id: string;
  name: string;
  label: string;
}

@Component({
  selector: 'app-blockchains-input',
  templateUrl: './blockchains-input.component.html',
  styleUrls: ['./blockchains-input.component.scss']
})
export class BlockchainsInputComponent implements OnInit, OnChanges {

  @Input() selectedBlockchain: IBlockchain;
  @Input() blockchains: IBlockchains;

  @Output() blockchainChanges = new EventEmitter<IBlockchain>();

  @ViewChild('app-input-dropdown') inputDropdown: InputDropdownComponent<BlockchainDropdownData>;

  public readonly blockchainLabelComponentClass = BlockchainLabelComponent;
  public blockchainsInputData = List<BlockchainDropdownData>();
  public selectedBlockchainInputData: BlockchainDropdownData;
  public blockchainsSortOrder = ['name', 'label'];

  constructor() {}

  ngOnInit() {}

  ngOnChanges() {
    this.setBlockchainsInputData();
  }

  /**
   * Takes the components selected in input-dropdown.
   * Every blockchain-component has `id`, which is actually the `name` of that blockchain.
   */
  public onBlockchainChanges(blockchainComponent) {
    this.selectedBlockchain = Object.values(this.blockchains).find(blockchain => blockchain.name === blockchainComponent.id);
    this.setBlockchainsInputData();

    this.blockchainChanges.emit(this.selectedBlockchain);
  }

  /**
   * Sets blockchains' input data to pass to the input-dropdown and components' creator.
   */
  private setBlockchainsInputData() {
    this.blockchainsInputData = List(
      Object.values(this.blockchains)
        .map(blockchain =>
          ({ inputs: { blockchain }, id: blockchain.name, name: blockchain.name, label: blockchain.label })
    ));

    if (this.selectedBlockchain) {
      this.selectedBlockchainInputData = {
        inputs: { blockchain: this.selectedBlockchain, selected: true },
        id: this.selectedBlockchain.name,
        name: this.selectedBlockchain.name,
        label: this.selectedBlockchain.label
      };
    } else {
      this.selectedBlockchainInputData = null;
    }
  }
}
