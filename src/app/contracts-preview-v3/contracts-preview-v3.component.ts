import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import BigNumber from 'bignumber.js';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Web3Service } from '../services/web3/web3.service';

import { CONTRACT_STATES } from '../contract-preview/contract-states';
import { ContractsService } from '../services/contracts/contracts.service';
import { UserInterface } from '../services/user/user.interface';
import { UserService } from '../services/user/user.service';

import { CHAIN_OF_NETWORK, ERC20_TOKEN_ABI } from '../services/web3/web3.constants';
import SWAPS_ABI from './SWAPS_ABI';

export interface IContractV3 {
  id?: number;
  name: string;
  network?: number;
  base_address?: string;
  quote_address?: string;
  base_limit?: string;
  quote_limit?: string;
  stop_date?: number;
  owner_address?: string;
  public?: boolean | undefined;
  unique_link?: string;
  unique_link_url?: string;

  broker_fee: boolean;
  broker_fee_address: string;
  broker_fee_base: number;
  broker_fee_quote: number;

  quote_coin_id?: number;
  base_coin_id?: number;
  comment?: string;
  tokens_info?: {
    base?: {
      token: any;
      amount?: string;
    };
    quote?: {
      token: any;
      amount?: string;
    };
  };

  whitelist?: any;
  whitelist_address?: any;
  min_base_wei?: any;
  memo_contract?: any;
  min_quote_wei?: any;

  state?: string;
  isSwapped?: boolean;
  isAuthor?: boolean;
  user?: number;
  contract_state?: string;
  notification?: boolean;
  notification_tg: string;
  notification_email: string;
  created_date: string;

  contract_address: string;
}

export const CHAINS_OF_NETWORKS = {
  1: {
    image: './assets/images/icons/coins/eth.png',
    name: 'Ethereum'
  },
  22: {
    image: './assets/images/icons/coins/bnb.svg',
    name: 'Binance Smart Chain'
  },
  24: {
    image: './assets/images/icons/coins/matic.svg',
    name: 'Matic'
  }
};
export const SWAPS_V2 = {
  OLD_ABI: SWAPS_ABI.OLD_ABI,
  ABI: SWAPS_ABI.ABI,
  // TestNets
  // ADDRESSES: {
  //   ethereum: '0x02a9cc38b711c8349cca67a82f5cbd3c0021ab1d',
  //   binance: '0x2822a211905c10EFf60Eb9bc2777F34243Cef83E',
  //   matic: '0x86842ac94c1Eab9f00076464769e1eB4F6Ad6F90'
  // }
  OLD_ADDRESSES: {
    ethereum: '0xAAaCFf66942df4f1e1cB32C21Af875AC971A8117',
    binance: '0xEAFbb34e5200Fff4F3998e8af43721090A3Aeef3',
    matic: '0xcae0b5F3b4256572875E4E2A2ee2C83434097Af8'
  },
  ADDRESSES: {
    ethereum: '0xf954DdFbC31b775BaaF245882701FB1593A7e7BC',
    binance: '0xCA647085E35ABd0d6eBD8cf56f8bF4f285A42951',
    matic: '0x9a234B3899CAf15413987BF94e19539ccd43A9C1'
  }
};

export const FIX_TIME = new Date(2019, 9, 11, 12, 11).getTime();

@Component({
  selector: 'app-contracts-preview-v3',
  templateUrl: './contracts-preview-v3.component.html',
  styleUrls: ['./contracts-preview-v3.component.scss'],
  providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }]
})
export class ContractsPreviewV3Component implements OnDestroy, OnInit {
  @ViewChild('metaMaskError', { static: true }) metaMaskError: TemplateRef<any>;

  private metaMaskErrorModal: MatDialogRef<any>;

  private contractAddress: string;

  public displayingBlockchains = CHAINS_OF_NETWORKS;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private web3Service: Web3Service,
    private dialog: MatDialog,
    private contractService: ContractsService,
    private userService: UserService
  ) {
    this.originalContract = this.route.snapshot.data.contract;

    const contractAddress = this.originalContract.contract_address;
    if (
      SWAPS_V2.ADDRESSES[CHAIN_OF_NETWORK[this.originalContract.network]].toLowerCase() ===
      contractAddress.toLowerCase()
    ) {
      // new contract
      this.contractAddress = SWAPS_V2.ADDRESSES[CHAIN_OF_NETWORK[this.originalContract.network]];
      this.web3Contract = this.web3Service.getContract(
        SWAPS_V2.ABI,
        this.contractAddress,
        this.originalContract.network
      );
    } else {
      // old contract
      this.contractAddress =
        SWAPS_V2.OLD_ADDRESSES[CHAIN_OF_NETWORK[this.originalContract.network]];
      this.web3Contract = this.web3Service.getContract(
        SWAPS_V2.OLD_ABI,
        this.contractAddress,
        this.originalContract.network
      );
    }

    this.updatePromise = true;

    this.copiedAddresses = {};
    this.analyzeContract();

    this.maximumInvestors = 10;

    this.currentUser = this.userService.getUserModel();
    this.userService.getCurrentUser().subscribe((userProfile: UserInterface) => {
      this.currentUser = userProfile;
      this.checkAuthor();
    });
    this.checkAuthor();
    this.formatNumberParams = {
      groupSeparator: ',',
      groupSize: 3,
      decimalSeparator: '.'
    };

    const tokenInfo = this.originalContract.tokens_info;

    if (new Date(this.originalContract.created_date).getTime() < FIX_TIME) {
      tokenInfo.base.amount = new BigNumber(tokenInfo.base.amount)
        .div(tokenInfo.base.token.decimals ** 10)
        .toString();
      tokenInfo.quote.amount = new BigNumber(tokenInfo.quote.amount)
        .div(tokenInfo.quote.token.decimals ** 10)
        .toString();
    }

    this.rateFormat = {
      groupSeparator: ',',
      groupSize: 3,
      decimalSeparator: '.'
    };

    const baseAmount = new BigNumber(tokenInfo.base.amount);
    const quoteAmount = new BigNumber(tokenInfo.quote.amount);

    this.rates = {
      normal: baseAmount.div(quoteAmount),
      reverted: quoteAmount.div(baseAmount)
    };
    const linkUrl = `${location.origin}/trades/public-v3/${this.originalContract.unique_link}`;
    this.originalContract.unique_link_url = linkUrl;
    this.contractAdditional.link = linkUrl;

    // this.checkCMCRate();
    this.countChecked = 0;
    this.isAuth = false;
    this.allowanceObj = {
      quote: {
        isAllowance: true,
        isAllowancing: false,
        isContributing: false
      },
      base: {
        isAllowance: true,
        isAllowancing: false,
        isContributing: false
      }
    };

    this.baseAmountShorted = this.getAmountShorted(this.tokens.base.amount);
    this.quoteAmountShorted = this.getAmountShorted(this.tokens.quote.amount);
  }

  public allowanceObj;

  private token;

  private amount;

  private countChecked: number;

  public metamaskError: any;

  public providedAddresses: any = {};

  private getAccountsSubscriber;

  get tokens() {
    return this.originalContract.tokens_info;
  }

  private web3Contract;

  public isRemindered: boolean;

  private tokenContract: any;

  private updatePromise;

  // public cmcRate: {
  //   absCmcRange?: number;
  //   direct: number;
  //   revert: number;
  //   cmcRange?: number;
  // };

  private currentUser: any;

  public isAuth;

  public maximumInvestors;

  public rates;

  private formatNumberParams;

  public rateFormat;

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

  private oldCheckedState: string;

  public baseAmountShorted: string;

  public quoteAmountShorted: string;

  private readonly shortedFormat = {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 0
  };

  private readonly BILLION = 1e9;

  private readonly MILLION = 1e6;

  // private checkCMCRate() {
  // const baseCoin = this.originalContract.tokens_info.base.token;
  // const quoteCoin = this.originalContract.tokens_info.quote.token;
  //
  // if (
  //   baseCoin.cmc_id &&
  //   quoteCoin.cmc_id &&
  //   baseCoin.cmc_id > 0 &&
  //   quoteCoin.cmc_id > 0
  // ) {
  //   this.cmcRate = {
  //     direct: new BigNumber(quoteCoin.rate).div(baseCoin.rate).toNumber(),
  //     revert: new BigNumber(baseCoin.rate).div(quoteCoin.rate).toNumber(),
  //   };
  //   this.cmcRate.cmcRange =
  //     this.rates.normal.toNumber() - this.cmcRate.direct;
  //   this.cmcRate.absCmcRange =
  //     Math.abs(-(this.rates.normal.toNumber() / this.cmcRate.direct - 1)) *
  //     100;
  // } else {
  //   this.cmcRate = undefined;
  // }
  // }

  private getAmountShorted(value: string): string {
    const amount = new BigNumber(value);
    if (amount.isGreaterThanOrEqualTo(this.BILLION * 100)) {
      return `${amount.div(this.BILLION).toFormat(0, this.shortedFormat)}B`;
    }
    if (amount.isGreaterThanOrEqualTo(this.MILLION * 100)) {
      return `${amount.div(this.MILLION).dp(0).toFormat(0, this.shortedFormat)}M`;
    }
    return amount.toFormat(this.shortedFormat);
  }

  private checkSwapState() {
    const memo = this.originalContract.memo_contract;
    return new Promise(resolve => {
      const checkAfterActive = () => {
        this.web3Contract.methods
          .isSwapped(memo)
          .call()
          .then(
            isSwapped => {
              this.originalContract.isSwapped = isSwapped;
              if (isSwapped) {
                this.originalContract.contract_state = 'DONE';
                this.originalContract.state = 'DONE';
                resolve('DONE');
              } else {
                this.web3Contract.methods
                  .isCancelled(memo)
                  .call()
                  .then(isCancelled => {
                    if (isCancelled) {
                      this.originalContract.contract_state = 'CANCELLED';
                      this.originalContract.state = 'CANCELLED';
                      resolve('CANCELLED');
                    } else {
                      this.originalContract.contract_state = 'ACTIVE';
                      this.originalContract.state = 'ACTIVE';
                      resolve('ACTIVE');
                    }
                  });
              }
            },
            err => {
              console.log(err);
            }
          );
      };
      if (
        this.originalContract.contract_state === 'CREATED' ||
        !this.originalContract.owner_address
      ) {
        this.web3Contract.methods
          .owners(memo)
          .call()
          .then(
            address => {
              if (address && address !== '0x0000000000000000000000000000000000000000') {
                this.originalContract.owner_address = address;
                checkAfterActive();
              } else {
                resolve(this.originalContract.state);
              }
            },
            err => {
              console.log(err);
            }
          );
      } else {
        checkAfterActive();
      }
    });
  }

  private getBaseRaised() {
    const details = this.originalContract;
    const decimalsAmount = new BigNumber(details.tokens_info.base.amount).times(
      details.tokens_info.base.token.decimals ** 10
    );

    this.web3Contract.methods
      .baseRaised(details.memo_contract)
      .call()
      .then(
        result => {
          result = result === null ? 0 : result;
          result = new BigNumber(result);
          this.contractInfo.baseRaised = result
            .div(details.tokens_info.base.token.decimals ** 10)
            .toString();
          this.contractInfo.baseLeft = decimalsAmount.minus(result);
          this.contractInfo.baseLeftString = this.contractInfo.baseLeft
            .div(details.tokens_info.base.token.decimals ** 10)
            .toString(10);
        },
        err => {
          console.log(err);
        }
      );
  }

  private getQuoteRaised() {
    const details = this.originalContract;
    const decimalsAmount = new BigNumber(details.tokens_info.quote.amount).times(
      details.tokens_info.quote.token.decimals ** 10
    );

    this.web3Contract.methods
      .quoteRaised(details.memo_contract)
      .call()
      .then(
        result => {
          result = result === null ? 0 : result;
          result = new BigNumber(result);
          this.contractInfo.quoteRaised = result
            .div(10, details.tokens_info.quote.token.decimals ** 10)
            .toString();
          console.log(this.contractInfo.quoteRaised);
          this.contractInfo.quoteLeft = decimalsAmount.minus(result);
          this.contractInfo.quoteLeftString = this.contractInfo.quoteLeft
            .div(details.tokens_info.quote.token.decimals ** 10)
            .toString(10);
        },
        err => {
          console.log(err);
        }
      );
  }

  private getBaseInvestors() {
    const details = this.originalContract;

    this.web3Contract.methods
      .baseInvestors(details.memo_contract)
      .call()
      .then(
        result => {
          this.contractInfo.baseInvestors = result ? result.length : 0;
        },
        () => {
          this.contractInfo.baseInvestors = 0;
          // console.log(err);
        }
      );
  }

  private getQuoteInvestors() {
    const details = this.originalContract;
    this.web3Contract.methods
      .quoteInvestors(details.memo_contract)
      .call()
      .then(
        result => {
          this.contractInfo.quoteInvestors = result ? result.length : 0;
        },
        () => {
          this.contractInfo.quoteInvestors = 0;
        }
      );
  }

  private getBaseBrokersPercent() {
    const details = this.originalContract;

    this.web3Contract.methods
      .myWishBasePercent()
      .call()
      .then(
        result => {
          this.contractInfo.baseBrokerPercent = result / 100 + details.broker_fee_base;
          this.contractInfo.baseBrokerAmount = new BigNumber(details.tokens_info.base.amount)
            .div(100)
            .times(this.contractInfo.baseBrokerPercent)
            .toString();
        },
        err => {
          console.log(err);
        }
      );
  }

  private getQuoteBrokersPercent() {
    const details = this.originalContract;

    this.web3Contract.methods
      .myWishQuotePercent()
      .call()
      .then(
        result => {
          this.contractInfo.quoteBrokerPercent = result / 100 + details.broker_fee_quote;
          this.contractInfo.quoteBrokerAmount = new BigNumber(details.tokens_info.quote.amount)
            .div(100)
            .times(this.contractInfo.quoteBrokerPercent)
            .toString();
        },
        err => {
          console.log(err);
        }
      );
  }

  private getContractInfoFromBlockchain() {
    const details = this.originalContract;
    this.getBaseRaised();
    this.getQuoteRaised();
    this.getBaseInvestors();
    this.getQuoteInvestors();

    this.getBaseBrokersPercent();
    this.getQuoteBrokersPercent();

    if (details.contract_state === 'ACTIVE') {
      if (this.oldCheckedState !== details.contract_state) {
        this.web3Contract.methods
          .owners(details.memo_contract)
          .call()
          .then(
            res => {
              this.originalContract.owner_address = res;
            },
            err => {
              console.log(err);
            }
          );
      }

      this.web3Contract.methods
        .isSwapped(details.memo_contract)
        .call()
        .then(
          res => {
            this.originalContract.isSwapped = res;
          },
          err => {
            console.log(err);
          }
        );
    } else {
      this.originalContract.isSwapped = false;
    }
    this.oldCheckedState = details.contract_state;
  }

  private analyzeContract() {
    if (!this.updatePromise) {
      return;
    }

    const getContractInfo = () => {
      switch (this.originalContract.state) {
        case 'ACTIVE':
        case 'DONE':
        case 'CREATED':
        case 'EXPIRED':
        case 'CANCELLED':
          this.getContractInfo();
          break;
        default:
          break;
      }

      if (this.originalContract.state === 'ACTIVE') {
        this.updateContractTimer = setTimeout(() => {
          this.getBaseContract();
        }, 4000);
      }
    };

    if (this.originalContract.state === 'ACTIVE' || this.originalContract.state === 'CREATED') {
      this.updatePromise = this.checkSwapState().then(() => {
        getContractInfo();
      });
    } else {
      getContractInfo();
    }
  }

  private checkAuthor() {
    if (this.currentUser) {
      this.originalContract.isAuthor = this.currentUser.id === this.originalContract.user;
    }
  }

  private getBaseContract() {
    this.updatePromise = this.contractService
      .getSwapByPublic(this.originalContract.unique_link)
      .then(result => {
        const { tokens_info: tokensInfo } = this.originalContract;
        const swapped = this.originalContract.isSwapped;
        const { state } = this.originalContract;
        const contractState = this.originalContract.contract_state;
        const ownerAddress = this.originalContract.owner_address;
        const { isAuthor } = this.originalContract;

        this.originalContract = result;
        this.originalContract.tokens_info = tokensInfo;
        this.originalContract.isSwapped = swapped;
        this.originalContract.state = state;
        this.originalContract.contract_state = contractState;
        this.originalContract.owner_address = ownerAddress;
        this.originalContract.isAuthor = isAuthor;
        this.originalContract.unique_link_url = this.contractAdditional.link;
      })
      .finally(() => {
        this.analyzeContract();
      });
  }

  private getContractInfo() {
    this.checkAuthor();
    this.getContractInfoFromBlockchain();
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

    const sendTransaction = (wallet?) => {
      return this.web3Service
        .sendTransaction(
          {
            from: wallet,
            to: this.contractAddress,
            data: methodSignature
          },
          this.originalContract.network
        )
        .catch(err => {
          this.metamaskError = err;
          this.metaMaskErrorModal = this.dialog.open(this.metaMaskError, {
            width: '480px',
            panelClass: 'custom-dialog-container'
          });
        });
    };

    // window['ethereum'].enable().then((accounts) => {
    //   const address = accounts[0];
    return sendTransaction();
    // });
  }

  public closeMetaMaskError() {
    this.metaMaskErrorModal.close();
  }

  public sendCancel() {
    const details = this.originalContract;
    const cancelMethod = this.web3Service.getMethodInterface('cancel', SWAPS_V2.ABI);
    const cancelSignature = this.web3Service.encodeFunctionCall(cancelMethod, [
      details.memo_contract
    ]);

    const cancelTransaction = (wallet?) => {
      return this.web3Service
        .sendTransaction(
          {
            from: wallet,
            to: this.contractAddress,
            data: cancelSignature
          },
          this.originalContract.network
        )
        .catch(err => {
          this.metamaskError = err;
          this.metaMaskErrorModal = this.dialog.open(this.metaMaskError, {
            width: '480px',
            panelClass: 'custom-dialog-container'
          });
        });
    };

    // window['ethereum'].enable().then((accounts) => {
    //   const address = accounts[0];
    return cancelTransaction();
    // });
  }

  public initialisationTrade() {
    const details = this.originalContract;

    const interfaceMethod = this.web3Service.getMethodInterface('createOrder', SWAPS_V2.ABI);

    let baseDecimalsTimes = 1;
    let quoteDecimalsTimes = 1;

    if (new Date(this.originalContract.created_date).getTime() > FIX_TIME) {
      baseDecimalsTimes = details.tokens_info.base.token.decimals ** 10;
      quoteDecimalsTimes = details.tokens_info.quote.token.decimals ** 10;
    }

    const trxRequest = [
      details.memo_contract,
      details.tokens_info.base.token.address,
      details.tokens_info.quote.token.address,
      new BigNumber(details.base_limit || '0').times(baseDecimalsTimes).toString(10),
      new BigNumber(details.quote_limit || '0').times(quoteDecimalsTimes).toString(10),
      Math.round(new Date(details.stop_date).getTime() / 1000).toString(10),
      details.whitelist ? details.whitelist_address : '0x0000000000000000000000000000000000000000',
      new BigNumber(details.min_base_wei || '0').times(baseDecimalsTimes).toString(10),
      new BigNumber(details.min_quote_wei || '0').times(quoteDecimalsTimes).toString(10),
      details.broker_fee
        ? details.broker_fee_address
        : '0x0000000000000000000000000000000000000000',
      details.broker_fee ? new BigNumber(details.broker_fee_base).times(100).toString(10) : '0',
      details.broker_fee ? new BigNumber(details.broker_fee_quote).times(100).toString(10) : '0'
    ];

    const activateSignature = this.web3Service.encodeFunctionCall(interfaceMethod, trxRequest);
    const sendActivateTrx = (wallet?) => {
      return this.web3Service
        .sendTransaction(
          {
            from: wallet,
            to: this.contractAddress,
            data: activateSignature
          },
          this.originalContract.network
        )
        .catch(err => {
          this.metamaskError = err;
          this.metaMaskErrorModal = this.dialog.open(this.metaMaskError, {
            width: '480px',
            panelClass: 'custom-dialog-container'
          });
        });
    };
    // window['ethereum'].enable().then((accounts) => {
    //   const address = accounts[0];
    return sendActivateTrx();
    // });
  }

  private getContributeTransaction(amount, token) {
    let tokenModel: any;
    const details = this.originalContract;

    switch (token) {
      case 'base':
        tokenModel = details.tokens_info.base;
        break;
      case 'quote':
        tokenModel = details.tokens_info.quote;
        break;
      default:
        break;
    }

    const stringAmountValue = new BigNumber(amount)
      .times(tokenModel.token.decimals ** 10)
      .toString(10);

    const value = stringAmountValue;

    const depositMethod = this.web3Service.getMethodInterface('deposit', SWAPS_V2.ABI);
    const depositSignature = this.web3Service.encodeFunctionCall(depositMethod, [
      details.memo_contract,
      tokenModel.token.address,
      stringAmountValue
    ]);

    const contributeTransaction = wallet => {
      return this.web3Service
        .sendTransaction(
          {
            from: wallet.address,
            to: this.contractAddress,
            data: depositSignature,
            value: tokenModel.token.isNative ? value : undefined
          },
          this.originalContract.network
        )
        .catch(err => {
          this.metamaskError = err;
          this.metaMaskErrorModal = this.dialog.open(this.metaMaskError, {
            width: '480px',
            panelClass: 'custom-dialog-container'
          });
        });
    };

    return {
      action: contributeTransaction,
      signature: depositSignature,
      token: tokenModel.token
    };
  }

  public sendTransaction(wallet, transaction) {
    if (this.metamaskError) {
      switch (this.metamaskError.code) {
        case 3:
          this.getAccountsSubscriber.unsubscribe();
          this.updateAddresses(
            false,
            address => {
              this.sendTransaction(
                {
                  type: 'metamask',
                  address
                },
                transaction
              );
            },
            transaction
          );
          break;
        default:
          this.metaMaskErrorModal = this.dialog.open(this.metaMaskError, {
            width: '480px',
            panelClass: 'custom-dialog-container'
          });
      }
      return;
    }

    if (transaction.onlyOwner && wallet.address !== transaction.onlyOwner) {
      this.metamaskError = {
        msg:
          'This address is not authorized for the operation. Please choose another address in MetaMask.'
      };
      this.metaMaskErrorModal = this.dialog.open(this.metaMaskError, {
        width: '480px',
        panelClass: 'custom-dialog-container'
      });

      this.metaMaskErrorModal.afterClosed().subscribe(() => {
        this.metamaskError = false;
      });
      return;
    }

    transaction.inProgress = true;

    transaction
      .action(wallet)
      .then(() => {
        transaction.confirmed = true;
        this.isAuth = true;
      })
      .finally(() => {
        this.allowanceObj[this.token].isAllowancing = false;
        this.allowanceObj[this.token].isAllowance = true;
        transaction.inProgress = false;
        if (transaction.onComplete) {
          // transaction.onComplete();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.updateContractTimer) {
      window.clearTimeout(this.updateContractTimer);
    }
    this.updatePromise = false;
    // this.getAccountsSubscriber.unsubscribe();
  }

  public quoteWillGetValue(amount) {
    const details = this.originalContract;

    const quoteWillValue = new BigNumber(amount).times(
      new BigNumber(details.tokens_info.quote.amount).div(
        new BigNumber(details.tokens_info.base.amount)
      )
    );

    const quoteFeeValue = quoteWillValue.div(100).times(this.contractInfo.quoteBrokerPercent);

    if (!quoteFeeValue.isNaN()) {
      return quoteWillValue.minus(quoteFeeValue).toString(10);
    }
    return quoteWillValue.toString(10);
  }

  public baseWillGetValue(amount) {
    const details = this.originalContract;
    const baseWillValue = new BigNumber(amount).times(
      new BigNumber(details.tokens_info.base.amount).div(
        new BigNumber(details.tokens_info.quote.amount)
      )
    );

    const baseFeeValue = baseWillValue.div(100).times(this.contractInfo.baseBrokerPercent);

    if (!baseFeeValue.isNaN()) {
      return baseWillValue.minus(baseFeeValue).toString(10);
    }
    return baseWillValue.toString(10);
  }

  public sendContribute(amount, token) {
    try {
      this.amount = amount;
      this.token = token;
      // const details = this.originalContract;

      // if (details.contract_state === 'CREATED') {
      //   this.initialisationTrade();
      //   return;
      // }

      this.createTransactions(amount, token);
    } catch (err) {
      console.log(err);
    }
  }

  private checkAllowance = (wallet, token, amount) => {
    return new Promise((resolve, reject) => {
      const tokenModel = this.originalContract.tokens_info[token].token;
      amount = new BigNumber(amount).times(tokenModel.decimals ** 10);

      this.tokenContract = this.web3Service.getContract(
        ERC20_TOKEN_ABI,
        tokenModel.address,
        this.originalContract.network
      );
      this.tokenContract.methods
        .allowance(wallet, this.contractAddress)
        .call()
        .then(
          result => {
            console.log(`ALLOWANCE: ${result}`);
            console.log(`NEED AMOUNT: ${amount}`);

            result = result ? result.toString(10) : result;
            result = result === '0' ? null : result;
            if (result && new BigNumber(result).minus(amount).isPositive()) {
              resolve(true);
            } else {
              reject();
            }
          },
          () => {
            reject();
          }
        );
    });
  };

  private createTransactions(amount, token) {
    try {
      if (Number.isNaN(Number(amount))) {
        return;
      }

      const contributeData = this.getContributeTransaction(amount, token);
      const textAmount = amount;

      const approveMethod = this.web3Service.getMethodInterface('approve');
      const approveSignature = this.web3Service.encodeFunctionCall(approveMethod, [
        this.contractAddress,
        new BigNumber(90071992.5474099)
          .times(Math.max(contributeData.token.decimals, 7) ** 10)
          .toString(10)
      ]);

      const approveTransaction = wallet => {
        return this.web3Service
          .sendTransaction(
            {
              from: wallet.address,
              to: contributeData.token.address,
              data: approveSignature
            },
            this.originalContract.network
          )
          .catch(err => {
            this.metamaskError = err;
            this.metaMaskErrorModal = this.dialog.open(this.metaMaskError, {
              width: '480px',
              panelClass: 'custom-dialog-container'
            });
          });
      };
      this.updateAddresses(true);

      let transaction: any = {
        title: `Make the transfer of ${textAmount} ${contributeData.token.token_short_title} tokens to contract`,
        to: this.contractAddress,
        data: contributeData.signature,
        action: contributeData.action,
        ethValue: !contributeData.token.isNative ? undefined : textAmount
      };
      this.allowanceObj[token].isAllowancing = true;

      if (!contributeData.token.isNative) {
        window['ethereum'].enable().then(accounts => {
          return new Promise(() => {
            const address = accounts[0];
            this.checkAllowance(address, token, amount)
              .then(() => {
                this.createTransactionObj(transaction);
              })
              .catch(() => {
                transaction = {
                  title: `Authorise the contract for getting ${contributeData.token.token_short_title} tokens`,
                  to: contributeData.token.address,
                  data: approveSignature,
                  checkComplete: this.checkAllowance,
                  action: approveTransaction
                };
                this.createTransactionObj(transaction);
              });
          });
        });
      } else {
        this.createTransactionObj(transaction);
      }
    } catch (e) {
      console.log(e);
    }
  }

  private createTransactionObj(transaction) {
    window['ethereum'].enable().then(accounts => {
      const address = accounts[0];
      this.sendTransaction(
        {
          type: 'metamask',
          address
        },
        transaction
      );
    });
  }

  private updateAddresses(ifEnabled?, cb?, transaction?) {
    this.getAccountsSubscriber = this.web3Service
      .getAccounts(false, ifEnabled, this.originalContract.network)
      .subscribe(
        (addresses: any) => {
          this.metamaskError = false;
          this.providedAddresses = addresses;
          if (cb) {
            cb(addresses.metamask[0]);
          }
          if (
            transaction &&
            transaction.checkComplete &&
            addresses.metamask &&
            addresses.metamask[0]
          ) {
            transaction.checkComplete(addresses.metamask[0], this.token, this.amount).then(
              result => {
                if (result) {
                  transaction.confirmed = true;
                }
              },
              () => {}
            );
          }
        },
        error => {
          this.metamaskError = error;
        }
      );

    return this.getAccountsSubscriber;
  }

  ngOnInit() {
    const tokens = ['base', 'quote'];
    tokens.forEach(token => {
      const contributeData = this.getContributeTransaction(0, token);

      window['ethereum'].enable().then(accounts => {
        const address = accounts[0];
        if (!contributeData.token.isNative) {
          this.checkAllowance(address, token, 0).catch(() => {
            this.allowanceObj[token].isAllowance = false;
          });
        }
      });
    });
  }
}
