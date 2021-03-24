import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Web3PublicService } from '../../../core/services/blockchain/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from '../../models/blockchain/BLOCKCHAIN_NAME';

@Component({
  selector: 'app-address-input',
  templateUrl: './address-input.component.html',
  styleUrls: ['./address-input.component.scss']
})
export class AddressInputComponent {
  @Input() inputLabelText: string;

  @Output() addressEmitter = new EventEmitter<string>();

  public isAddressCorrect: boolean;

  public isAddressIncorrect: boolean;

  constructor(private web3: Web3PublicService) {}

  public checkAddressCorrectness(addressQuery: string) {
    if (!addressQuery) {
      this.isAddressCorrect = false;
      this.isAddressIncorrect = false;
    } else {
      this.isAddressCorrect = this.web3[BLOCKCHAIN_NAME.ETHEREUM].isAddressCorrect(addressQuery);
      this.isAddressIncorrect = !this.isAddressCorrect;

      if (this.isAddressCorrect) {
        this.addressEmitter.emit(addressQuery);
      }
    }
  }
}
