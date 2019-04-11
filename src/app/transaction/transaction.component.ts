import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {Web3Service} from '../services/web3/web3.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit, OnDestroy {


  private getAccountsTimeout;

  constructor(
    @Inject(MAT_DIALOG_DATA) public trxData,
    private web3Service: Web3Service
  ) {
    this.copiedData = {};
  }

  public copiedData: any = {};
  public providedAddresses: any = {};

  ngOnInit() {

    this.getAccountsTimeout = setInterval(() => {
      this.updateAddresses();
    }, 1000);
  }

  ngOnDestroy() {
    clearTimeout(this.getAccountsTimeout);
  }

  private updateAddresses() {
    this.web3Service.getAccounts().then((addresses) => {
      this.providedAddresses = addresses;
    });
  }

  public copyText(val: string, field) {
    if (this.copiedData[field]) {
      return;
    }
    this.copiedData[field] = true;
    setTimeout(() => {
      this.copiedData[field] = false;
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
