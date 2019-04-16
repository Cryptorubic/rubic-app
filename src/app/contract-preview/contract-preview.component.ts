import {Component, OnDestroy, OnInit} from '@angular/core';
import {IContract} from '../contract-form/contract-form.component';
import {ActivatedRoute} from '@angular/router';

import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {Web3Service} from '../services/web3/web3.service';
import BigNumber from 'bignumber.js';

import {CONTRACT_STATES} from './contract-states';
import {MatDialog} from '@angular/material';
import {TransactionComponent} from '../transaction/transaction.component';
import {ContractsService} from '../services/contracts/contracts.service';
import {UserInterface} from '../services/user/user.interface';
import {UserService} from '../services/user/user.service';

@Component({
  selector: 'app-contract-preview',
  templateUrl: './contract-preview.component.html',
  styleUrls: ['./contract-preview.component.scss']
})
export class ContractPreviewComponent implements OnInit, OnDestroy {

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
    const rate = new BigNumber(tokenInfo.base.amount).div(tokenInfo.quote.amount);
    this.rateFormat = {groupSeparator: ',', groupSize: 3, decimalSeparator: '.'};
    this.rates = {
      normal: rate,
      reverted: rate.pow(-1)
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

  public fromBigNumber(num, decimals) {
    return new BigNumber(num).div(Math.pow(10, decimals)).toString(10);
  }

  private getBaseRaised(web3Contract) {
    web3Contract.methods.baseRaised().call().then((result) => {
      const details = this.originalContract.contract_details;
      this.contractInfo.baseRaised = this.fromBigNumber(result, details.tokens_info.base.token.decimals);
      this.contractInfo.baseRaisedFormatted = new BigNumber(this.contractInfo.baseRaised).toFormat(this.formatNumberParams);
      this.contractInfo.baseRaised = this.contractInfo.baseRaised.toString(10);
      const baseLeft = new BigNumber(details.tokens_info.base.amount).minus(this.contractInfo.baseRaised);
      this.contractInfo.baseLeftFormated = baseLeft.toFormat(this.formatNumberParams);
      this.contractInfo.baseLeft = baseLeft.toString(10);
    }, err => {
      console.log(err);
    });
  }
  private getQuoteRaised(web3Contract) {
    web3Contract.methods.quoteRaised().call().then((result) => {
      const details = this.originalContract.contract_details;
      this.contractInfo.quoteRaised = this.fromBigNumber(result, details.tokens_info.quote.token.decimals);
      this.contractInfo.quoteRaisedFormatted = new BigNumber(this.contractInfo.quoteRaised).toFormat(this.formatNumberParams);
      this.contractInfo.quoteRaised = this.contractInfo.quoteRaised.toString(10);
      const quoteLeft = new BigNumber(details.tokens_info.quote.amount).minus(this.contractInfo.quoteRaised);
      this.contractInfo.quoteLeftFormated = quoteLeft.toFormat({groupSeparator: ',', groupSize: 3, decimalSeparator: '.'});
      this.contractInfo.quoteLeft = quoteLeft.toString(10);
    }, err => {
      console.log(err);
    });
  }
  private getBaseInvestors(web3Contract) {
    web3Contract.methods.baseInvestors().call().then((result) => {
      this.contractInfo.baseInvestors = result.length;
    }, err => {
      console.log(err);
    });
  }
  private getQuoteInvestors(web3Contract) {
    web3Contract.methods.quoteInvestors().call().then((result) => {
      this.contractInfo.quoteInvestors = result.length;
    }, err => {
      console.log(err);
    });
  }

  private getContractInfoFromBlockchain(web3Contract) {
    this.getBaseRaised(web3Contract);
    this.getQuoteRaised(web3Contract);
    this.getBaseInvestors(web3Contract);
    this.getQuoteInvestors(web3Contract);
    web3Contract.methods.isSwapped().call().then((result) => {
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
    const details = this.originalContract.contract_details;
    const contractData = details.eth_contract;
    const web3Contract = this.web3Service.getContract(contractData.abi, contractData.address);
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
        description:
          'You can take back your contributions at any time until the contract’s execution.\n' +
          'Use the same address which you used for the contribution.',
        transactions: [{
            to: contract.address,
          data: methodSignature,
          action: sendTransaction
        }]
      }
    });
  }


  public sendCancel() {
    const cancelMethod = this.web3Service.getMethodInterface('cancel', this.originalContract.contract_details.eth_contract.abi);
    const cancelSignature = this.web3Service.encodeFunctionCall(
      cancelMethod, []
    );

    const cancelTransaction = (wallet) => {
      this.web3Service.sendTransaction({
        from: wallet.address,
        to: this.originalContract.contract_details.eth_contract.address,
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
          to: this.originalContract.contract_details.eth_contract.address,
          data: cancelSignature,
          action: cancelTransaction
        }],
        title: 'Cancel',
        description: 'To Cancel the swap you need to make the transaction from the management address'
      }
    });
  }

  private sendEth(amount, amountDecimals) {
    const transferEth = (wallet) => {
      this.web3Service.sendTransaction({
        from: wallet.address,
        to: this.originalContract.contract_details.eth_contract.address,
        value: amountDecimals
      }, 'metamask').then((result) => {
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
          to: this.originalContract.contract_details.eth_contract.address,
          action: transferEth,
          ethValue: amount
        }],
        title: 'Contribute',
        description: 'Send ' + amount + ' ETH to the contract address directly'
      }
    });
  }

  public sendContribute(amount, token) {

    let tokenAddress: any;
    let depositMethodName: string;
    let amountDecimals: string;

    const details = this.originalContract.contract_details;
    const contract = this.originalContract.contract_details.eth_contract;

    const bigNumberAmount = new BigNumber(amount);

    if (bigNumberAmount.isNaN()) {
      return;
    }

    switch (token) {
      case 'base':
        tokenAddress = details.tokens_info.base;
        depositMethodName = 'depositBaseTokens';
        amountDecimals = bigNumberAmount.times(Math.pow(10, details.tokens_info.base.token.decimals)).toString(10);
        break;
      case 'quote':
        tokenAddress = details.tokens_info.quote;
        depositMethodName = 'depositQuoteTokens';
        amountDecimals = bigNumberAmount.times(Math.pow(10, details.tokens_info.quote.token.decimals)).toString(10);
        break;
    }

    if (tokenAddress.token.isEther) {
      this.sendEth(amount, amountDecimals);
      return;
    }

    const approveMethod = this.web3Service.getMethodInterface('approve');

    const approveSignature = this.web3Service.encodeFunctionCall(
      approveMethod, [
        contract.address,
        amountDecimals
      ]
    );

    const depositMethod = this.web3Service.getMethodInterface(depositMethodName, contract.abi);
    const depositSignature = this.web3Service.encodeFunctionCall(
      depositMethod, [amountDecimals]
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
          to: contract.address,
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

}
