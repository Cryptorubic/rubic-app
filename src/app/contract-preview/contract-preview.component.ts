import { Component, OnInit } from '@angular/core';
import {IContract} from '../contract-form/contract-form.component';
import {ActivatedRoute} from '@angular/router';

import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {Web3Service} from '../services/web3/web3.service';
import BigNumber from 'bignumber.js';

import {CONTRACT_STATES} from './contract-states';
import {MatDialog} from '@angular/material';
import {TransactionComponent} from '../transaction/transaction.component';
import {TOKENS_ADDRESSES} from '../services/web3/web3.constants';

@Component({
  selector: 'app-contract-preview',
  templateUrl: './contract-preview.component.html',
  styleUrls: ['./contract-preview.component.scss']
})
export class ContractPreviewComponent implements OnInit {

  public originalContract: IContract;
  public copiedAddresses: any;
  public states = CONTRACT_STATES;

  public contractAdditional: {
    source_link?: SafeResourceUrl;
    link?: string;
  } = {};

  public contractInfo: any = {};

  public fromBigNumber(num, decimals) {
    return new BigNumber(num).div(Math.pow(10, decimals)).toString(10);
  }

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private web3Service: Web3Service,
    private dialog: MatDialog
  ) {
    this.originalContract = this.route.snapshot.data.contract;
    this.copiedAddresses = {};
    switch (this.originalContract.state) {
      case 'POSTPONED':
        return;
      case 'ACTIVE':
      case 'EXPIRED':
        this.contractAdditional.link =
          location.origin + '/public/' + this.originalContract.contract_details.unique_link;

        this.contractAdditional.source_link =
          this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(
            new Blob(
              [this.originalContract.contract_details.eth_contract.source_code],
              { type: 'application/octet-stream' }
              )
          ));
        this.getContractInfo();
        break;
    }
  }


  private getContractInfo() {
    const details = this.originalContract.contract_details;
    const contractData = details.eth_contract;
    const web3Contract = this.web3Service.getContract(contractData.abi, contractData.address);
    // this.contractInfo
    web3Contract.methods.baseRaised().call().then((result) => {
      this.contractInfo.baseRaised = this.fromBigNumber(result, details.tokens_info.base.token.decimals);
    });
    web3Contract.methods.quoteRaised().call().then((result) => {
      this.contractInfo.quoteRaised = this.fromBigNumber(result, details.tokens_info.quote.token.decimals);
    });
    web3Contract.methods.baseInvestors().call().then((result) => {
      this.contractInfo.baseInvestors = result.length;
    });
    web3Contract.methods.quoteInvestors().call().then((result) => {
      this.contractInfo.quoteInvestors = result.length;
    });

  }


  ngOnInit() {
  }


  get tokens() {
    return this.originalContract.contract_details.tokens_info;
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


  public sendRefund(methodName) {
    const details = this.originalContract.contract_details;
    const contract = this.originalContract.contract_details.eth_contract;

    const interfaceMethod = this.web3Service.getMethodInterface(methodName, contract.abi);
    const methodSignature = this.web3Service.encodeFunctionCall(interfaceMethod, []);

    const sendTransaction = (wallet) => {
      this.web3Service.sendTransaction({
        from: wallet.address,
        to: contract.address,
        data: methodSignature
      }, wallet.type).then((result) => {
        console.log(result);
      }, (err) => {
        console.log(err);
      });
    };

    this.dialog.open(TransactionComponent, {
      width: '38.65em',
      panelClass: 'custom-dialog-container',
      data: {
        title: 'Refund',
        description: 'Description description description',
        transactions: [{
          from: details.owner_address,
            to: contract.address,
          data: methodSignature,
          action: sendTransaction
        }]
  }
    });
  }




  public sendContribute(amount, token) {

    let tokenAddress: any;
    let depositMethodName: string;
    let amountDecimals: string;

    const details = this.originalContract.contract_details;
    const contract = this.originalContract.contract_details.eth_contract;

    switch (token) {
      case 'base':
        tokenAddress = details.tokens_info.base;
        depositMethodName = 'depositBase';
        amountDecimals = new BigNumber(amount).times(Math.pow(10, details.tokens_info.base.token.decimals)).toString(10);
        break;
      case 'quote':
        tokenAddress = details.tokens_info.quote;
        depositMethodName = 'depositQuote';
        amountDecimals = new BigNumber(amount).times(Math.pow(10, details.tokens_info.quote.token.decimals)).toString(10);
        break;
    }

    // const batch = this.web3Service.BatchRequest();

    const approveMethod = this.web3Service.getMethodInterface('approve');

    const approveSignature = this.web3Service.encodeFunctionCall(
      approveMethod, [
        contract.address,
        amountDecimals
      ]
    );

    const depositMethod = this.web3Service.getMethodInterface(depositMethodName, contract.abi);
    const depositSignature = this.web3Service.encodeFunctionCall(
      depositMethod, []
    );

    const approveTransaction = (wallet) => {
      this.web3Service.sendTransaction({
        from: wallet.address,
        to: tokenAddress.token.address,
        data: approveSignature
      }, wallet.type).then((result) => {
        console.log(result);
      }, (err) => {
        console.log(err);
      });
    };

    const contributeTransaction = (wallet) => {
      this.web3Service.sendTransaction({
        from: wallet.address,
        to: contract.address,
        data: depositSignature
      }, wallet.type).then((result) => {
        console.log(result);
      }, (err) => {
        console.log(err);
      });
    };




    this.dialog.open(TransactionComponent, {
      width: '38.65em',
      panelClass: 'custom-dialog-container',
      data: {
        transactions: [{
          title: 'Authorise the contract for getting ' + amount + ' ' + tokenAddress.token.token_short_name + ' tokens',
          to: tokenAddress.token.address,
          data: approveSignature,
          action: approveTransaction
        }, {
          title: 'Make the transfer of ' + amount + ' ' + tokenAddress.token.token_short_name + ' tokens to contract',
          from: details.owner_address,
          to: contract.address,
          data: depositSignature,
          action: contributeTransaction
        }],
        title: 'Contribute',
        description: 'For contribution you need to make 2 transactions: authorise the contract and make the transfer (you cann read why these steps are needed here)'
      }
    });

  }

}
