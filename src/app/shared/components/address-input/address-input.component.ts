import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-address-input',
  templateUrl: './address-input.component.html',
  styleUrls: ['./address-input.component.scss']
})
export class AddressInputComponent {
  @Input() addressPattern: string;

  @Input() inputLabelText: string;

  @Output() addressValidated = new EventEmitter<string>();

  @ViewChild('addressInput') addressInputModel: NgModel;

  constructor() {}

  public onAddressChange(addressQuery: string) {
    if (this.addressInputModel.value && this.addressInputModel.valid) {
      this.addressValidated.emit(addressQuery);
    }
  }
}
