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
import {ContactOwnerComponent} from '../contact-owner/contact-owner.component';
import {ERC20_TOKEN_ABI} from '../services/web3/web3.constants';
import {SWAPS_V2} from '../contract-form-all/contract-v2-details';

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

  public fromBigNumber(num, decimals) {
    return new BigNumber(num).div(Math.pow(10, decimals)).toString(10);
  }

  private getBaseRaised(web3Contract) {
    web3Contract.methods.baseRaised().call().then((result) => {
      const details = this.originalContract.contract_details;
      this.contractInfo.baseRaised = result;
      this.contractInfo.baseLeft = new BigNumber(details.tokens_info.base.amount).minus(result);
      this.contractInfo.baseLeftString = this.contractInfo.baseLeft.div(Math.pow(10, details.tokens_info.base.token.decimals)).toString(10);
    }, err => {
      console.log(err);
    });
  }
  private getQuoteRaised(web3Contract) {
    web3Contract.methods.quoteRaised().call().then((result) => {
      const details = this.originalContract.contract_details;
      this.contractInfo.quoteRaised = result;
      this.contractInfo.quoteLeft = new BigNumber(details.tokens_info.quote.amount).minus(result);
      this.contractInfo.quoteLeftString = this.contractInfo.quoteLeft.div(Math.pow(10, details.tokens_info.quote.token.decimals)).toString(10);
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
    }).finally(() => {
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
      return this.web3Service.sendTransaction({
        from: wallet.address,
        to: contract.address,
        data: methodSignature
      }, wallet.type);
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
        }],
        afterComplete: {
          title: 'Refund completed',
          description: ''
        }
      }
    });
  }


  public sendCancel() {
    const cancelMethod = this.web3Service.getMethodInterface('cancel', this.originalContract.contract_details.eth_contract.abi);
    const cancelSignature = this.web3Service.encodeFunctionCall(
      cancelMethod, []
    );

    const cancelTransaction = (wallet) => {
      return this.web3Service.sendTransaction({
        from: wallet.address,
        to: this.originalContract.contract_details.eth_contract.address,
        data: cancelSignature
      }, wallet.type);
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
        description: 'To Cancel the swap you need to make the transaction from the management address',
        afterComplete: {
          title: 'Cancellation completed',
          description: ''
        }
      }
    });
  }

  private sendEth(amount, amountDecimals) {
    const transferEth = (wallet) => {
      return this.web3Service.sendTransaction({
        from: wallet.address,
        to: this.originalContract.contract_details.eth_contract.address,
        value: amountDecimals
      }, 'metamask');
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

    amountDecimals = bigNumberAmount.toString(10);

    switch (token) {
      case 'base':
        tokenAddress = details.tokens_info.base;
        depositMethodName = 'depositBaseTokens';
        amount = bigNumberAmount.div(Math.pow(10, details.tokens_info.base.token.decimals)).toString(10);
        break;
      case 'quote':
        tokenAddress = details.tokens_info.quote;
        depositMethodName = 'depositQuoteTokens';
        amount = bigNumberAmount.div(Math.pow(10, details.tokens_info.quote.token.decimals)).toString(10);
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


    const checkAllowance = (wallet) => {
      return new Promise((resolve, reject) => {
        const tokenModel = tokenAddress.token;
        const tokenContract = this.web3Service.getContract(ERC20_TOKEN_ABI, tokenModel.address);

        tokenContract.methods.allowance(wallet, this.originalContract.contract_details.eth_contract.address).call().then((result) => {
          result = result ? result.toString(10) : result;
          result = result === '0' ? null : result;
          if (result && new BigNumber(result).minus(amount).isPositive()) {
            resolve(true);
          } else {
            reject(false);
          }
        }, () => {
          reject(false);
        });
      });
    };



    const approveTransaction = (wallet) => {
      return this.web3Service.sendTransaction({
        from: wallet.address,
        to: tokenAddress.token.address,
        data: approveSignature
      }, wallet.type);
    };

    const contributeTransaction = (wallet) => {
      return this.web3Service.sendTransaction({
        from: wallet.address,
        to: contract.address,
        data: depositSignature
      }, wallet.type);
    };




    this.dialog.open(TransactionComponent, {
      width: '38.65em',
      panelClass: 'custom-dialog-container',
      data: {
        transactions: [{
          title: 'Authorise the contract for getting ' + amount + ' ' + tokenAddress.token.token_short_name + ' tokens',
          to: tokenAddress.token.address,
          data: approveSignature,
          action: approveTransaction,
          checkComplete: checkAllowance
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
