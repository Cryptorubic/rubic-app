import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/ADDRESS_TYPE';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

@Component({
  selector: 'app-terms-n-conditions-container',
  templateUrl: './terms-n-conditions-container.component.html',
  styleUrls: ['./terms-n-conditions-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsNConditionsContainerComponent {
  @Input() public whatIsBlockchain: {
    name: string;
    href: string;
  };

  @Input() public toWalletAddress: string;

  @Input() public isBridgeSupported: boolean;

  @Input() public toBlockchain: BLOCKCHAIN_NAME;

  public ADDRESS_TYPE = ADDRESS_TYPE;

  constructor() {}
}
