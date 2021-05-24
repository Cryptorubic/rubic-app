import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wallet-address-form',
  templateUrl: './wallet-address-form.component.html',
  styleUrls: ['./wallet-address-form.component.scss']
})
export class WalletAddressFormComponent {
  @Input() set walletAddress(value: string) {
    if (!this.isWithEditing) {
      this.isEditingSectionOpened = false;
    } else {
      this.isEditingSectionOpened = !value;
    }
    this._walletAddress = value;
  }

  get walletAddress() {
    return this._walletAddress;
  }

  @Input() walletAddressLink: string;

  @Input() walletAddressPattern: string;

  @Input() set isWithEditing(value: boolean) {
    if (!value) {
      this.isEditingSectionOpened = false;
    } else {
      this.isEditingSectionOpened = !this._walletAddress;
    }
    this._isWithEditing = value;
  }

  get isWithEditing() {
    return this._isWithEditing;
  }

  @Output() walletAddressValidated = new EventEmitter<string>();

  private _walletAddress: string;

  private _isWithEditing: boolean;

  public isEditingSectionOpened = false;

  constructor() {}

  public onAddWalletAddress(walletAddress: string): void {
    this.walletAddressValidated.emit(walletAddress);
    this.isEditingSectionOpened = false;
  }
}
