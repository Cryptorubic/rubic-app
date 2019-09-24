import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {Web3Service} from '../services/web3/web3.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit, OnDestroy {

  constructor(
    @Inject(MAT_DIALOG_DATA) public trxData,
    private web3Service: Web3Service
  ) {
    this.copiedData = {};
    this.openedInstruction = {};
    this.countChecked = 0;
  }


  private getAccountsSubscriber;

  public copiedData: any = {};
  public providedAddresses: any = {};
  public openedInstruction: any;

  private countChecked: number;

  ngOnInit() {
    this.updateAddresses();
  }

  ngOnDestroy() {
    this.getAccountsSubscriber.unsubscribe();
  }
  private checkAllChecked(forceCheck?) {
    this.countChecked++;
    if ((this.countChecked === this.trxData.transactions.length) || forceCheck) {
      this.trxData.checked = true;
    }
  }

  private updateAddresses() {
    this.getAccountsSubscriber = this.web3Service.getAccounts().subscribe((addresses: any) => {
      if (addresses !== null) {
        this.providedAddresses = addresses;
        this.trxData.transactions.forEach((transaction) => {
          if (transaction.checkComplete && addresses.metamask && addresses.metamask[0]) {
            transaction.checkComplete(addresses.metamask[0]).then((result) => {
              if (result) {
                transaction.confirmed = true;
                this.checkAllChecked();
              }
            }, (err) => {
              this.checkAllChecked();
            });
          } else {
            this.checkAllChecked();
          }
        });
      } else {
        this.checkAllChecked(true);
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

  public sendTransaction(wallet, transaction) {
    transaction.action(wallet).then((result) => {
      transaction.confirmed = true;
    });
  }
}
