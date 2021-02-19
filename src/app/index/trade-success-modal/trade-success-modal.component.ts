import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-trade-success-modal',
  templateUrl: './trade-success-modal.component.html',
  styleUrls: ['./trade-success-modal.component.scss']
})
export class TradeSuccessModalComponent implements OnInit {
  @Input() transactionId: string;
  @Input() network: string;
  @Output() onClose = new EventEmitter<void>();

  public scannerLink: string;

  public onCloseHandler = () => {
    this.onClose.emit();
  };

  constructor() {}

  ngOnInit() {
    if (this.network === 'kovan') {
      this.scannerLink = 'https://kovan.etherscan.io/tx/';
    } else {
      this.scannerLink = 'https://etherscan.io/tx/';
    }
  }
}
