import {Component, OnDestroy, OnInit} from '@angular/core';
import {IContract} from '../contract-form/contract-form.component';
import {ActivatedRoute} from '@angular/router';

import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {Web3Service} from '../services/web3/web3.service';
import BigNumber from 'bignumber.js';

import {CONTRACT_STATES} from '../contract-preview/contract-states';
import {MatDialog} from '@angular/material';
import {TransactionComponent} from '../transaction/transaction.component';
import {ContractsService} from '../services/contracts/contracts.service';
import {UserInterface} from '../services/user/user.interface';
import {UserService} from '../services/user/user.service';

import {SWAPS_V2} from '../contract-form-two/contract-v2-details';
import {ContactOwnerComponent} from '../contact-owner/contact-owner.component';

@Component({
  selector: 'app-contract-preview-two',
  templateUrl: './contract-preview-two.component.html',
  styleUrls: ['../contract-preview/contract-preview.component.scss']
})
export class ContractPreviewTwoComponent implements OnInit, OnDestroy {

  private currentUser: any;

  public maximumInvestors;
  public rates;
  private formatNumberParams;

  public rateFormat;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private web3Service: Web3Service,
    private dialog: MatDialog,
    private contractService: ContractsService,
    private userService: UserService
  ) {
    this.originalContract = this.route.snapshot.data.contract;
    this.copiedAddresses = {};
    this.analyzeContract();

    this.maximumInvestors = 10;

    this.currentUser = this.userService.getUserModel();
    this.userService.getCurrentUser().subscribe((userProfile: UserInterface) => {
      this.currentUser = userProfile;
      this.checkAuthor();
    });
    this.checkAuthor();
    this.formatNumberParams = {groupSeparator: ',', groupSize: 3, decimalSeparator: '.'};

    const tokenInfo = this.originalContract.contract_details.tokens_info;

    this.rateFormat = {groupSeparator: ',', groupSize: 3, decimalSeparator: '.'};

    const baseAmount = new BigNumber(tokenInfo.base.amount).div(Math.pow(10, tokenInfo.base.token.decimals));
    const quoteAmount = new BigNumber(tokenInfo.quote.amount).div(Math.pow(10, tokenInfo.quote.token.decimals));

    this.rates = {
      normal: baseAmount.div(quoteAmount),
      reverted: quoteAmount.div(baseAmount)
    };
  }


  get tokens() {
    return this.originalContract.contract_details.tokens_info;
  }

  public originalContract: IContract;
  public copiedAddresses: any;
  public states = CONTRACT_STATES;
  public revertedRate: boolean;

  public activeSide: string;

  public contractAdditional: {
    source_link?: SafeResourceUrl;
    link?: string;
  } = {};

  public contractInfo: any = {};

  private updateContractTimer;

  public fromBigNumber(num, decimals, format?) {
    const bigNumberValue = new BigNumber(num).div(Math.pow(10, decimals));
    if (format) {
      return bigNumberValue.toFormat(this.formatNumberParams);
    } else {
      return bigNumberValue.toString(10);
    }

  }

  private getBaseRaised(web3Contract) {
    const details = this.originalContract.contract_details;
    web3Contract.methods.baseRaised(details.memo_contract).call().then((result) => {
      this.contractInfo.baseRaised = result;
      this.contractInfo.baseLeft = new BigNumber(details.tokens_info.base.amount).minus(result);
      this.contractInfo.baseLeftString = this.contractInfo.baseLeft.div(Math.pow(10, details.tokens_info.base.token.decimals)).toString(10);
    }, err => {
      console.log(err);
    });
  }
  private getQuoteRaised(web3Contract) {
    const details = this.originalContract.contract_details;
    web3Contract.methods.quoteRaised(details.memo_contract).call().then((result) => {
      this.contractInfo.quoteRaised = result;
      this.contractInfo.quoteLeft = new BigNumber(details.tokens_info.quote.amount).minus(result);
      this.contractInfo.quoteLeftString = this.contractInfo.quoteLeft.div(Math.pow(10, details.tokens_info.quote.token.decimals)).toString(10);
    }, err => {
      console.log(err);
    });
  }

  private getBaseInvestors(web3Contract) {
    const details = this.originalContract.contract_details;
    web3Contract.methods.baseInvestors(details.memo_contract).call().then((result) => {
      this.contractInfo.baseInvestors = result.length;
    }, err => {
      console.log(err);
    });
  }
  private getQuoteInvestors(web3Contract) {
    const details = this.originalContract.contract_details;
    web3Contract.methods.quoteInvestors(details.memo_contract).call().then((result) => {
      this.contractInfo.quoteInvestors = result.length;
    }, err => {
      console.log(err);
    });
  }

  private getContractInfoFromBlockchain(web3Contract) {
    const details = this.originalContract.contract_details;
    this.getBaseRaised(web3Contract);
    this.getQuoteRaised(web3Contract);
    this.getBaseInvestors(web3Contract);
    this.getQuoteInvestors(web3Contract);
    web3Contract.methods.isSwapped(details.memo_contract).call().then((result) => {
      this.originalContract.isSwapped = result;
    }, err => {
      console.log(err);
    });
  }

  private analyzeContract() {
    switch (this.originalContract.state) {
      case 'POSTPONED':
        return;
      case 'ACTIVE':
      case 'DONE':
      case 'EXPIRED':
        this.contractAdditional.link =
          location.origin + '/public-v2/' + this.originalContract.contract_details.unique_link;

        this.originalContract.contract_details.unique_link_url = this.contractAdditional.link;

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

    if (this.originalContract.state === 'ACTIVE') {
      this.updateContractTimer = setTimeout(() => {
        this.getBaseContract();
      }, 10000);
    }
  }

  private checkAuthor() {
    if (this.currentUser) {
      this.originalContract.isAuthor = this.currentUser.id === this.originalContract.user;
    }
  }

  private getBaseContract() {
    this.contractService.getContractByPublic(this.originalContract.contract_details.unique_link).then((result) => {
      const tokens_info = this.originalContract.contract_details.tokens_info;
      const swapped = this.originalContract.isSwapped;
      this.originalContract = result;
      this.originalContract.contract_details.tokens_info = tokens_info;
      this.originalContract.isSwapped = swapped;
      this.analyzeContract();
    });
  }

  private getContractInfo() {
    const web3Contract = this.web3Service.getContract(SWAPS_V2.ABI, SWAPS_V2.ADDRESS);
    this.checkAuthor();
    this.getContractInfoFromBlockchain(web3Contract);
  }


  ngOnInit() {
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


  public sendRefund(token) {
    const details = this.originalContract.contract_details;
    const contract = this.originalContract.contract_details.eth_contract;

    const interfaceMethod = this.web3Service.getMethodInterface('refund', SWAPS_V2.ABI);
    const methodSignature = this.web3Service.encodeFunctionCall(interfaceMethod, [
      details.memo_contract,
      token.address
    ]);

    const sendTransaction = (wallet) => {
      this.web3Service.sendTransaction({
        from: wallet.address,
        to: SWAPS_V2.ADDRESS,
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
        description:
          'You can take back your contributions at any time until the contract’s execution.\n' +
          'Use the same address which you used for the contribution.',
        transactions: [{
          to: SWAPS_V2.ADDRESS,
          data: methodSignature,
          action: sendTransaction
        }]
      }
    });
  }


  public sendCancel() {

    const details = this.originalContract.contract_details;

    const cancelMethod = this.web3Service.getMethodInterface('cancel', SWAPS_V2.ABI);
    const cancelSignature = this.web3Service.encodeFunctionCall(
      cancelMethod, [details.memo_contract]
    );

    const cancelTransaction = (wallet) => {
      this.web3Service.sendTransaction({
        from: wallet.address,
        to: SWAPS_V2.ADDRESS,
        data: cancelSignature
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
          from: this.originalContract.contract_details.owner_address,
          to: SWAPS_V2.ADDRESS,
          data: cancelSignature,
          action: cancelTransaction
        }],
        title: 'Cancel',
        description: 'To cancel the swap you need to make the transaction from the management address'
      }
    });
  }

  private sendEth(bigNumberAmount, tokenInfo) {

    const details = this.originalContract.contract_details;

    const transferEth = (wallet) => {

      const stringAmountValue = bigNumberAmount.toString(10);
      const depositMethod = this.web3Service.getMethodInterface('deposit', SWAPS_V2.ABI);
      const depositSignature = this.web3Service.encodeFunctionCall(
        depositMethod, [details.memo_contract, tokenInfo.address, stringAmountValue]
      );

      this.web3Service.sendTransaction({
        from: wallet.address,
        to: SWAPS_V2.ADDRESS,
        value: stringAmountValue,
        data: depositSignature
      }, 'metamask').then((result) => {
        console.log(result);
      }, (err) => {
        console.log(err);
      });
    };

    const displayingAmount = bigNumberAmount.div(Math.pow(10, tokenInfo.decimals)).toFormat(this.formatNumberParams);

    this.dialog.open(TransactionComponent, {
      width: '38.65em',
      panelClass: 'custom-dialog-container',
      data: {
        transactions: [{
          to: SWAPS_V2.ADDRESS,
          action: transferEth,
          ethValue: displayingAmount
        }],
        title: 'Contribute',
        description: 'Send ' + displayingAmount + ' ETH to the contract address directly'
      }
    });
  }

  public sendContribute(amount, token) {

    let tokenAddress: any;

    const details = this.originalContract.contract_details;

    const bigNumberAmount = new BigNumber(amount);

    if (bigNumberAmount.isNaN()) {
      return;
    }

    switch (token) {
      case 'base':
        tokenAddress = details.tokens_info.base;
        break;
      case 'quote':
        tokenAddress = details.tokens_info.quote;
        break;
    }


    const stringAmountValue = bigNumberAmount.toString(10);

    if (tokenAddress.token.isEther) {
      this.sendEth(bigNumberAmount, tokenAddress.token);
      return;
    }

    const approveMethod = this.web3Service.getMethodInterface('approve');


    const approveSignature = this.web3Service.encodeFunctionCall(
      approveMethod, [
        SWAPS_V2.ADDRESS,
        stringAmountValue
      ]
    );

    const depositMethod = this.web3Service.getMethodInterface('deposit', SWAPS_V2.ABI);
    const depositSignature = this.web3Service.encodeFunctionCall(
      depositMethod, [details.memo_contract, tokenAddress.token.address, stringAmountValue]
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
        to: SWAPS_V2.ADDRESS,
        data: depositSignature
      }, wallet.type).then((result) => {
        console.log(result);
      }, (err) => {
        console.log(err);
      });
    };

    const textAmount = this.fromBigNumber(amount, tokenAddress.token.decimals);

    this.dialog.open(TransactionComponent, {
      width: '38.65em',
      panelClass: 'custom-dialog-container',
      data: {
        transactions: [{
          title: 'Authorise the contract for getting ' + textAmount + ' ' + tokenAddress.token.token_short_name + ' tokens',
          to: tokenAddress.token.address,
          data: approveSignature,
          action: approveTransaction
        }, {
          title: 'Make the transfer of ' + textAmount + ' ' + tokenAddress.token.token_short_name + ' tokens to contract',
          to: SWAPS_V2.ADDRESS,
          data: depositSignature,
          action: contributeTransaction
        }],
        title: 'Contribute',
        description: 'For contribution you need to make 2 transactions: authorise the contract and make the transfer'
      }
    });

  }


  ngOnDestroy(): void {
    if (this.updateContractTimer) {
      window.clearTimeout(this.updateContractTimer);
    }
  }

  public openContactForm() {
    this.dialog.open(ContactOwnerComponent, {
      width: '38.65em',
      panelClass: 'custom-dialog-container',
      data: this.originalContract
    });
  }


  public quoteWillGetValue(amount) {
    const details = this.originalContract.contract_details;
    return new BigNumber(amount).div(details.tokens_info.base.amount).times(details.tokens_info.quote.amount);
  }

  public baseWillGetValue(amount) {
    const details = this.originalContract.contract_details;
    return new BigNumber(amount).div(details.tokens_info.quote.amount).times(details.tokens_info.base.amount);
  }

}
