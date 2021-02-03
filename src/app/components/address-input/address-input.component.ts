import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {DropdownComponentData} from "../input-dropdown/types";
import {InputDropdownComponent} from "../input-dropdown/input-dropdown.component";
import {List} from "immutable";

interface AddressDropdownData extends DropdownComponentData {
  inputs: {
    address: string;
  },
  id: string,
  sortParameters: {
    address: string;
  }
}

@Component({
  selector: 'app-address-input',
  templateUrl: './address-input.component.html',
  styleUrls: ['./address-input.component.scss']
})
export class AddressInputComponent implements OnInit, OnChanges {

  @Input() inputLabelText: string;
  @Input() addresses: string[];

  @ViewChild('app-input-dropdown') inputDropdown: InputDropdownComponent<AddressDropdownData>;

  public addressLabelComponentClass = AddressLabelComponent;
  public addressesDropdownData: List<AddressDropdownData>;
  public readonly addressSortOrder = ['address'];

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.addressesDropdownData = List(this.addresses.map(address =>
      ({ inputs: { address }, id: address, sortParameters: { address }})
    ));
  }
}

@Component({
  selector: 'address-label',
  template: `<div class="address-label">{{address}}</div>`,
  styleUrls: ['./address-input.component.scss']
})
export class AddressLabelComponent {

  @Input() address: string;

}
