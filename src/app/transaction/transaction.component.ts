import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {Web3Service} from '../services/web3/web3.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit, OnDestroy {


  private getAccountsSubscriber;

  constructor(
    @Inject(MAT_DIALOG_DATA) public trxData,
    private web3Service: Web3Service
  ) {
    this.copiedData = {};
  }

  public copiedData: any = {};
  public providedAddresses: any = {};

  ngOnInit() {
    this.updateAddresses();
  }

  ngOnDestroy() {
    this.getAccountsSubscriber.unsubscribe();
  }

  private updateAddresses() {
    this.getAccountsSubscriber = this.web3Service.getAccounts().subscribe((addresses) => {
      if (addresses !== null) {
        this.providedAddresses = addresses;
      }
    });
  }

  public onCopied(field) {
    if (this.copiedData[field]) {
      return;
    }
    this.copiedData[field] = true;
    setTimeout(() => {
      this.copiedData[field] = false;
    }, 1000);
  }

}
