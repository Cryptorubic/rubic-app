import {Component, Inject, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {Web3Service} from '../services/web3/web3.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit, OnDestroy {

  @ViewChild('metaMaskError') metaMaskError: TemplateRef<any>;

  private metaMaskErrorModal: MatDialogRef<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public trxData,
    private web3Service: Web3Service,
    private dialog: MatDialog
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
  public metamaskError: any;


  ngOnInit() {
    this.updateAddresses(true);
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

  private updateAddresses(ifEnabled?, cb?) {
    this.getAccountsSubscriber = this.web3Service.getAccounts(false, ifEnabled).subscribe((addresses: any) => {
      this.metamaskError = false;
      this.providedAddresses = addresses;
      if (cb) {
        cb(addresses.metamask[0]);
      }
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
    }, (error) => {
      this.metamaskError = error;
      this.checkAllChecked(true);
    });

    return this.getAccountsSubscriber;

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

    if (this.metamaskError) {
      switch (this.metamaskError.code) {
        case 3:
          this.getAccountsSubscriber.unsubscribe();
          this.updateAddresses(false, (address) => {
            this.sendTransaction({
              type: 'metamask',
              address
            }, transaction);
          });
          break;
        default:
          this.metaMaskErrorModal = this.dialog.open(this.metaMaskError, {
            width: '480px',
            panelClass: 'custom-dialog-container'
          });
      }
      return;
    }

    if (transaction.onlyOwner && (wallet.address !== transaction.onlyOwner)) {
      this.metamaskError = {
        msg: 'This address is not authorized for the operation. Please choose another address in MetaMask.'
      };
      this.metaMaskErrorModal = this.dialog.open(this.metaMaskError, {
        width: '480px',
        panelClass: 'custom-dialog-container'
      });
      console.log(this.metaMaskErrorModal);
      this.metaMaskErrorModal.afterClosed().subscribe(() => {
        this.metamaskError = false;
      });
      return;
    }



    transaction.inProgress = true;

    transaction.action(wallet).then((result) => {
      transaction.confirmed = true;
    }).finally(() => {
      transaction.inProgress = false;
      if (transaction.onComplete) {
        transaction.onComplete();
      }
    });
  }

  public closeMetaMaskError() {
    this.metaMaskErrorModal.close();
  }

}
