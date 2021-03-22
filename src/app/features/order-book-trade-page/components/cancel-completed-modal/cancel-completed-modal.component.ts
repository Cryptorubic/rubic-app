import { Component, Input } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/ADDRESS_TYPE';

@Component({
  selector: 'app-cancel-completed-modal',
  templateUrl: './cancel-completed-modal.component.html',
  styleUrls: ['./cancel-completed-modal.component.scss']
})
export class CancelCompletedModalComponent {
  @Input() transactionId: string;

  @Input() blockchain: BLOCKCHAIN_NAME;

  public ADDRESS_TYPE = ADDRESS_TYPE;

  constructor() {}
}
