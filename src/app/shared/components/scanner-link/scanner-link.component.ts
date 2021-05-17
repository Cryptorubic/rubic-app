import { Component, Input } from '@angular/core';
import { BLOCKCHAIN_NAME } from '../../models/blockchain/BLOCKCHAIN_NAME';
import ADDRESS_TYPE from '../../models/blockchain/ADDRESS_TYPE';

@Component({
  selector: 'app-scanner-link',
  templateUrl: './scanner-link.component.html',
  styleUrls: ['./scanner-link.component.scss']
})
export class ScannerLinkComponent {
  @Input() address: string;

  @Input() blockchainName: BLOCKCHAIN_NAME;

  @Input() addressType: ADDRESS_TYPE;

  @Input() scannerLabel? = 'Explorer';

  constructor() {}
}
