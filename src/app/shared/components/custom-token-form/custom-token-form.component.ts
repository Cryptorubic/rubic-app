import { Component, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Token } from '../../models/tokens/Token';
import { BLOCKCHAIN_NAME } from '../../models/blockchain/BLOCKCHAIN_NAME';

@Component({
  selector: 'app-custom-token-form',
  templateUrl: './custom-token-form.component.html',
  styleUrls: ['./custom-token-form.component.scss']
})
export class CustomTokenFormComponent {
  @Input() type: 'from' | 'to';

  @Input() get isSectionOpened(): boolean {
    return this._isSectionOpened;
  }

  @Output() isSectionOpenedChange = new EventEmitter<boolean>();

  set isSectionOpened(value) {
    this._isSectionOpened = value;
    this.isSectionOpenedChange.emit(value);
  }

  @Input() get blockchain(): BLOCKCHAIN_NAME {
    return this._blockchain;
  }

  set blockchain(value) {
    this._blockchain = value;
    setTimeout(() => this.customTokenModel?.control.updateValueAndValidity());
  }

  @Input() get tokenAddress(): string {
    return this._tokenAddress;
  }

  @Output() tokenAddressChange = new EventEmitter<string>();

  set tokenAddress(value) {
    this._tokenAddress = value;
    this.tokenAddressChange.emit(value);
  }

  @Output() tokenIsValidated = new EventEmitter<Token>();

  @Output() addToken = new EventEmitter<Token>();

  @ViewChild('customTokenModel') customTokenModel: NgModel;

  private _isSectionOpened: boolean;

  private _blockchain: BLOCKCHAIN_NAME;

  private _tokenAddress: string;

  constructor() {}
}
