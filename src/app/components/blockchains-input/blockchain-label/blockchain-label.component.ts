import { Component, Input, OnInit } from '@angular/core';
import { IBlockchainShort } from '../types';

@Component({
  selector: 'app-blockchain-label',
  templateUrl: './blockchain-label.component.html',
  styleUrls: ['./blockchain-label.component.scss']
})
export class BlockchainLabelComponent implements OnInit {
  @Input() blockchain: IBlockchainShort;
  @Input() selected = false;

  constructor() {}

  ngOnInit() {}
}
