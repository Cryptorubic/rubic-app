import {Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import BigNumber from 'bignumber.js';
import {TOKENS_ADDRESSES} from '../../services/web3/web3.constants';
import {Web3Service} from '../../services/web3/web3.service';
import {MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-contract-form-pay',
  templateUrl: './contract-form-pay.component.html',
  styleUrls: ['./contract-form-pay.component.scss']
})
export class ContractFormPayComponent implements OnInit, OnDestroy {

  @Input () public contractCosts;
  @Input () public currentUser;
  @Input () public costsEmitter;

  public copiedAddresses = {};
  public trxDataFields: any = {};
  public providedAddresses: any = {};
  public replenishMethod: string;
  public costValue;

  public inProgress: boolean;

  @ViewChild('metaMaskErrorTpl') metaMaskErrorTpl: TemplateRef<any>;
  private metaMaskErrorModal: MatDialogRef<any>;


  public metaMaskError: any;

  public tokensAddresses = TOKENS_ADDRESSES;

  private getAccountsSubscriber;

  constructor(
    private web3Service: Web3Service,
    private dialog: MatDialog
  ) {
  }

  private updateDataFields() {
    this.trxDataFields.WISH = this.checkTRXData(this.contractCosts.WISH);
    this.trxDataFields.SWAP = this.checkTRXData(this.contractCosts.SWAP);
    this.trxDataFields.BNB = this.checkTRXData(this.contractCosts.BNB);

    this.costValue = new BigNumber(this.contractCosts.ETH).toString(10);
  }

  ngOnInit() {
    this.replenishMethod = 'SWAP';
    this.updateAddresses();
    this.updateDataFields();
    this.costsEmitter.subscribe((cost) => {
      this.contractCosts = cost;
      this.updateDataFields();
    });
  }

  ngOnDestroy() {
    this.costsEmitter.unsubscribe();
    this.getAccountsSubscriber.unsubscribe();
  }

  private updateAddresses() {
    this.getAccountsSubscriber = this.web3Service.getAccounts().subscribe((addresses) => {
      this.providedAddresses = addresses;
    }, (err) => {
      this.metaMaskError = err;
    });
  }


  public onCopied(field) {
    if (this.copiedAddresses[field]) {
      return;
    }
    this.copiedAddresses[field] = true;
    setTimeout(() => {
      this.copiedAddresses[field] = false;
    }, 1000);
  }



  public fromBigNumber(num, decimals) {
    return new BigNumber(num).div(Math.pow(10, decimals)).toString(10);
  }

  private checkTRXData(cost) {
    return this.web3Service.encodeFunctionCall(
      {
        name: 'transfer',
        type: 'function',
        inputs: [{
          type: 'address',
          name: 'to'
        }, {
          type: 'uint256',
          name: 'value'
        }]
      }, [
        this.currentUser.internal_address,
        new BigNumber(cost).toString(10)
      ]
    );
  }

  public payContractVia(coin) {

    if (coin !== 'ETH') {
      this.payContractViaTokens(coin);
    } else {
      this.payContractViaEth();
    }

  }

  private checkMetaMaskProvider() {
    if (this.metaMaskError) {
      console.log(this.metaMaskError);
      this.metaMaskErrorModal = this.dialog.open(this.metaMaskErrorTpl, {
        width: '480px',
        panelClass: 'custom-dialog-container'
      });
      return false;
    }
    return true;
  }

  private payContractViaTokens(token) {
    if (!this.checkMetaMaskProvider()) {
      return;
    }
    this.inProgress = true;
    this.web3Service.sendTransaction({
      from: this.providedAddresses.metamask[0],
      to: TOKENS_ADDRESSES[token],
      data: this.trxDataFields[token]
    }, 'metamask').then((result) => {
      console.log(result);
    }, (err) => {
      console.log(err);
      this.inProgress = false;
    });
  }


  public payContractViaEth() {
    if (!this.checkMetaMaskProvider()) {
      return;
    }
    this.inProgress = true;
    this.web3Service.sendTransaction({
      from: this.providedAddresses.metamask[0],
      to: this.currentUser.internal_address,
      value: this.costValue
    }, 'metamask').then((result) => {
      console.log(result);
    }, (err) => {
      this.inProgress = false;
      console.log(err);
    });
  }


}
