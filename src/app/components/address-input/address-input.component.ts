import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Web3PrivateService } from '../../services/blockchain/web3-private-service/web3-private.service';

@Component({
  selector: 'app-address-input',
  templateUrl: './address-input.component.html',
  styleUrls: ['./address-input.component.scss']
})
export class AddressInputComponent implements OnInit {
  @Input() inputLabelText: string;

  @Output() addressEmitter = new EventEmitter<string>();

  public isAddressCorrect: boolean;
  public isAddressIncorrect: boolean;

  constructor(private web3Api: Web3PrivateService) {}

  ngOnInit() {}

  public checkAddressCorrectness(addressQuery: string) {
    if (!addressQuery) {
      this.isAddressIncorrect = this.isAddressCorrect = false;
    } else {
      this.isAddressCorrect = this.web3Api.isAddressCorrect(addressQuery);
      this.isAddressIncorrect = !this.isAddressCorrect;

      if (this.isAddressCorrect) {
        this.addressEmitter.emit(addressQuery);
      }
    }
  }
}
