import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import ADDRESS_TYPE from '../../../../../shared/models/blockchain/ADDRESS_TYPE';

@Component({
  selector: 'app-trade-success-modal',
  templateUrl: './trade-success-modal.component.html',
  styleUrls: ['./trade-success-modal.component.scss']
})
export class TradeSuccessModalComponent {
  public ADDRESS_TYPE = ADDRESS_TYPE;

  @Input() transactionId: string;

  @Input() blockchainName: BLOCKCHAIN_NAME;

  @Output() onClose = new EventEmitter<void>();

  public onCloseHandler = () => {
    this.onClose.emit();
  };

  constructor() {}
}
