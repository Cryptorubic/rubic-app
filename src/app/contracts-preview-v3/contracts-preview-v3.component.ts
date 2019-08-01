import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
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
import {IContractV3} from '../contract-form-all/contract-form-all.component';

@Component({
  selector: 'app-contracts-preview-v3',
  templateUrl: './contracts-preview-v3.component.html',
  styleUrls: ['../contract-preview/contract-preview.component.scss']
})
export class ContractsPreviewV3Component implements OnInit, OnDestroy {

  @ViewChild('administratorContact') administratorContact: TemplateRef<any>;

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

    const tokenInfo = this.originalContract.tokens_info;

    this.rateFormat = {groupSeparator: ',', groupSize: 3, decimalSeparator: '.'};

    const baseAmount = new BigNumber(tokenInfo.base.amount).div(Math.pow(10, tokenInfo.base.token.decimals));
    const quoteAmount = new BigNumber(tokenInfo.quote.amount).div(Math.pow(10, tokenInfo.quote.token.decimals));

    this.rates = {
      normal: baseAmount.div(quoteAmount),
      reverted: quoteAmount.div(baseAmount)
    };
  }


  get tokens() {
    return this.originalContract.tokens_info;
  }

  public originalContract: IContractV3;
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
    const details = this.originalContract;
    if (details.state === 'ACTIVE' && details.isEthereum) {
      web3Contract.methods.baseRaised(details.memo_contract).call().then((result) => {
        this.contractInfo.baseRaised = result;
        this.contractInfo.baseLeft = new BigNumber(details.tokens_info.base.amount).minus(result);
        this.contractInfo.baseLeftString =
          this.contractInfo.baseLeft.div(Math.pow(10, details.tokens_info.base.token.decimals)).toString(10);
      }, err => {
        console.log(err);
      });
    } else {
      this.contractInfo.baseLeft = new BigNumber(details.tokens_info.base.amount);
      this.contractInfo.baseLeftString =
        this.contractInfo.baseLeft.div(Math.pow(10, details.tokens_info.base.token.decimals)).toString(10);
    }
  }
  private getQuoteRaised(web3Contract) {
    const details = this.originalContract;
    if (details.state === 'ACTIVE' && details.isEthereum) {
      web3Contract.methods.quoteRaised(details.memo_contract).call().then((result) => {
        this.contractInfo.quoteRaised = result;
        this.contractInfo.quoteLeft = new BigNumber(details.tokens_info.quote.amount).minus(result);
        this.contractInfo.quoteLeftString =
          this.contractInfo.quoteLeft.div(Math.pow(10, details.tokens_info.quote.token.decimals)).toString(10);
      }, err => {
        console.log(err);
      });
    } else {
      this.contractInfo.quoteLeft = new BigNumber(details.tokens_info.quote.amount);
      this.contractInfo.quoteLeftString =
        this.contractInfo.quoteLeft.div(Math.pow(10, details.tokens_info.quote.token.decimals)).toString(10);
    }
  }

  private getBaseInvestors(web3Contract) {
    const details = this.originalContract;

    if (details.state === 'ACTIVE' && details.isEthereum) {
      web3Contract.methods.baseInvestors(details.memo_contract).call().then((result) => {
        this.contractInfo.baseInvestors = result ? result.length : 0;
      }, err => {
        this.contractInfo.baseInvestors = 0;
        // console.log(err);
      });
    } else {
      this.contractInfo.baseInvestors = 0;
    }
  }

  private getQuoteInvestors(web3Contract) {
    const details = this.originalContract;
    if (details.state === 'ACTIVE' && details.isEthereum) {
      web3Contract.methods.quoteInvestors(details.memo_contract).call().then((result) => {
        this.contractInfo.quoteInvestors = result ? result.length : 0;
      }, err => {
        this.contractInfo.quoteInvestors = 0;
      });
    } else {
      this.contractInfo.quoteInvestors = 0;
    }
  }

  private getBaseBrokersPercent(web3Contract) {
    const details = this.originalContract;
    if (details.state === 'ACTIVE' && details.isEthereum) {
      web3Contract.methods.allBrokersBasePercent(details.memo_contract).call().then((result) => {
        this.contractInfo.baseBrokerPercent = result / 100;
        this.contractInfo.baseBrokerAmount =
          new BigNumber(details.tokens_info.base.amount).div(100).times(this.contractInfo.baseBrokerPercent);
      }, err => {
        console.log(err);
      });
    } else if (!details.isEthereum) {
      this.contractInfo.baseBrokerPercent = details.broker_fee_base;
      this.contractInfo.baseBrokerAmount =
        new BigNumber(details.tokens_info.base.amount).div(100).times(this.contractInfo.baseBrokerPercent);
    }
  }

  private getQuoteBrokersPercent(web3Contract) {
    const details = this.originalContract;
    if (details.state === 'ACTIVE' && details.isEthereum) {
      web3Contract.methods.allBrokersQuotePercent(details.memo_contract).call().then((result) => {
        this.contractInfo.quoteBrokerPercent = result / 100;
        this.contractInfo.quoteBrokerAmount =
          new BigNumber(details.tokens_info.quote.amount).div(100).times(this.contractInfo.quoteBrokerPercent);
      }, err => {
        console.log(err);
      });
    } else if (!details.isEthereum) {
      this.contractInfo.quoteBrokerPercent = details.broker_fee_quote;
      this.contractInfo.quoteBrokerAmount =
        new BigNumber(details.tokens_info.quote.amount).div(100).times(this.contractInfo.quoteBrokerPercent);
    }
  }

  private getContractInfoFromBlockchain(web3Contract) {
    const details = this.originalContract;

    this.getBaseRaised(web3Contract);
    this.getQuoteRaised(web3Contract);
    this.getBaseInvestors(web3Contract);
    this.getQuoteInvestors(web3Contract);

    this.getBaseBrokersPercent(web3Contract);
    this.getQuoteBrokersPercent(web3Contract);


    if (details.isEthereum) {
      web3Contract.methods.owners(details.memo_contract).call().then((result) => {
        if (result) {
          details.contract_state = 'ACTIVE';
        } else {
          details.contract_state = 'WAITING_FOR_ACTIVATION';
        }

        if (details.contract_state === 'ACTIVE') {
          web3Contract.methods.isSwapped(details.memo_contract).call().then((res) => {
            this.originalContract.isSwapped = res;
          }, err => {
            console.log(err);
          });
        } else {
          this.originalContract.isSwapped = false;
        }
      });
    } else {
      this.originalContract.isSwapped = false;
    }
  }

  private analyzeContract() {
    switch (this.originalContract.state) {
      case 'POSTPONED':
        return;
      case 'ACTIVE':
      case 'DONE':
      case 'EXPIRED':
      case 'CREATED':
      case 'WAITING_FOR_ACTIVATION':
        this.contractAdditional.link =
          location.origin + '/public-v3/' + this.originalContract.unique_link;
        this.originalContract.unique_link_url = this.contractAdditional.link;
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
    this.contractService.getSwapByPublic(this.originalContract.unique_link).then((result) => {
      const tokens_info = this.originalContract.tokens_info;
      const swapped = this.originalContract.isSwapped;
      this.originalContract = result;
      this.originalContract.tokens_info = tokens_info;
      this.originalContract.isSwapped = swapped;
    }).finally(() => {
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
    const details = this.originalContract;
    // const contract = this.originalContract.eth_contract;

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

    const details = this.originalContract;

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
          from: this.originalContract.owner_address,
          to: SWAPS_V2.ADDRESS,
          data: cancelSignature,
          action: cancelTransaction,
          onlyOwner: details.owner_address
        }],
        title: 'Cancel',
        description: 'To cancel the swap you need to make the transaction from the management address'
      }
    });
  }

  public sendContribute(amount, token) {

    if (!this.originalContract.isEthereum) {
      this.openAdministratorInfo();
      return;
    }

    let tokenAddress: any;

    const details = this.originalContract;

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

    let value: string;

    if (tokenAddress.token.isEther) {
      value = stringAmountValue;
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
        data: depositSignature,
        value: value || undefined
      }, wallet.type).then((result) => {
        console.log(result);
      }, (err) => {
        console.log(err);
      });
    };

    const textAmount = this.fromBigNumber(amount, tokenAddress.token.decimals);

    const transactionsList: any[] = [{
      title: !tokenAddress.token.isEther ?
        'Make the transfer of ' + textAmount + ' ' + tokenAddress.token.token_short_name + ' tokens to contract' : undefined,
      to: SWAPS_V2.ADDRESS,
      data: depositSignature,
      action: contributeTransaction,
      ethValue: !tokenAddress.token.isEther ? undefined : bigNumberAmount.div(Math.pow(10, tokenAddress.token.decimals)).toString(10)
    }];

    if (!tokenAddress.token.isEther) {
      transactionsList.unshift({
        title: 'Authorise the contract for getting ' + textAmount + ' ' + tokenAddress.token.token_short_name + ' tokens',
        to: tokenAddress.token.address,
        data: approveSignature,
        action: approveTransaction
      });
    }

    if (details.contract_state === 'WAITING_FOR_ACTIVATION') {

      const interfaceMethod = this.web3Service.getMethodInterface('createOrder', SWAPS_V2.ABI);

      const trxRequest = [
        details.memo_contract,
        details.base_address,
        details.quote_address,
        details.base_limit || 0,
        details.quote_limit || 0,
        (new Date(details.stop_date)).getTime(),
        details.whitelist ? details.whitelist_address : '0x0000000000000000000000000000000000000000',
        details.min_base_wei || '0',
        details.min_quote_wei || '0',
        details.broker_fee ? details.broker_fee_address : '0x0000000000000000000000000000000000000000',
        details.broker_fee ? (new BigNumber(details.broker_fee_base).times(100)).toString(10) : '0',
        details.broker_fee ? (new BigNumber(details.broker_fee_quote).times(100)).toString(10) : '0'
      ];

      const activateSignature = this.web3Service.encodeFunctionCall(interfaceMethod, trxRequest);

      const sendActivateTrx = (wallet) => {
        this.web3Service.sendTransaction({
          from: wallet.address,
          to: SWAPS_V2.ADDRESS,
          data: activateSignature
        }, wallet.type).then((result) => {
          console.log(result);
        }, (err) => {
          console.log(err);
        });
      };


      transactionsList.unshift({
        title: 'Сначала нужно активировать сделку, выполнив транзакцию',
        to: SWAPS_V2.ADDRESS,
        data: activateSignature,
        action: sendActivateTrx
      });
    }


    // 'Send ' + amount + ' ETH to the contract address directly'
    this.dialog.open(TransactionComponent, {
      width: '38.65em',
      panelClass: 'custom-dialog-container',
      data: {
        transactions: transactionsList,
        title: 'Contribute',
        description: !tokenAddress.token.isEther ?
          `For contribution you need to make ${transactionsList.length} transactions: authorise the contract and make the transfer` :
          'Make the transfer of ' + textAmount + ' ' + tokenAddress.token.token_short_name + ' tokens to contract'
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
    const details = this.originalContract;
    const quoteWillValue = new BigNumber(amount).div(details.tokens_info.base.amount).times(details.tokens_info.quote.amount);
    // const quoteFeeValue = quoteWillValue.div(100).times(this.contractInfo.quoteBrokerPercent);

    return quoteWillValue;
    // .minus(quoteFeeValue);
  }

  public baseWillGetValue(amount) {
    const details = this.originalContract;
    const baseWillValue = new BigNumber(amount).div(details.tokens_info.quote.amount).times(details.tokens_info.base.amount);
    // const baseFeeValue = baseWillValue.div(100).times(this.contractInfo.baseBrokerPercent);

    return baseWillValue;
    // .minus(baseFeeValue);
  }


  private openAdministratorInfo() {
    this.dialog.open(this.administratorContact, {
      width: '480px',
      panelClass: 'custom-dialog-container'
    });
  }

}
