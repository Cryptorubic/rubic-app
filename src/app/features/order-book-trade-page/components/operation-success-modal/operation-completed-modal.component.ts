import { Component, Input } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/ADDRESS_TYPE';

@Component({
  selector: 'app-operation-completed-modal',
  templateUrl: './operation-completed-modal.component.html',
  styleUrls: ['./operation-completed-modal.component.scss']
})
export class OperationCompletedModalComponent {
  @Input() transactionId: string;

  @Input() blockchain: BLOCKCHAIN_NAME;

  public ADDRESS_TYPE = ADDRESS_TYPE;

  constructor() {}
}
