import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import { Web3ApiService } from '../../services/web3Api/web3-api.service';

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

  constructor(private web3Api: Web3ApiService) { }

  ngOnInit() {
  }

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
