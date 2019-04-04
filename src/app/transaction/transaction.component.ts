import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {Web3Service} from '../services/web3/web3.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public trxData,
    private web3Service: Web3Service
  ) {
  }

  public copiedData: any = {};
  public providedAddresses: any = {};

  public copiedAddresses: any;

  ngOnInit() {

    this.web3Service.getAccounts().then((addresses) => {
      this.providedAddresses = addresses;
    });
  }

  public copyText(val: string, field) {
    if (this.copiedAddresses[field]) {
      return;
    }
    this.copiedAddresses[field] = true;
    setTimeout(() => {
      this.copiedAddresses[field] = false;
    }, 1000);

    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

  }


}
