import { Component, Input } from '@angular/core';
import { IBlockchainShort } from '../types';

@Component({
  selector: 'app-blockchain-label',
  templateUrl: './blockchain-label.component.html',
  styleUrls: ['./blockchain-label.component.scss']
})
export class BlockchainLabelComponent {
  @Input() blockchain: IBlockchainShort;

  @Input() selected = false;

  constructor() {}
}
