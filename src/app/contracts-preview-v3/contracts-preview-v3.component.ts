import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  Inject,
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Web3Service } from '../services/web3/web3.service';
import BigNumber from 'bignumber.js';

import { CONTRACT_STATES } from '../contract-preview/contract-states';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { TransactionComponent } from '../transaction/transaction.component';
import { ContractsService } from '../services/contracts/contracts.service';
import { UserInterface } from '../services/user/user.interface';
import { UserService } from '../services/user/user.service';

import { SWAPS_V2 } from '../contract-form-all/contract-v2-details';
import { ContactOwnerComponent } from '../contact-owner/contact-owner.component';
import { IContractV3 } from '../contract-form-all/contract-form-all.component';
import { ERC20_TOKEN_ABI } from '../services/web3/web3.constants';

export const FIX_TIME = new Date(2019, 9, 11, 12, 11).getTime();

@Component({
  selector: 'app-contracts-preview-v3',
  templateUrl: './contracts-preview-v3.component.html',
  styleUrls: ['../contract-preview/contract-preview.component.scss'],
  providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
})
export class ContractsPreviewV3Component implements OnDestroy, OnInit {
  @ViewChild('metaMaskError') metaMaskError: TemplateRef<any>;

  private metaMaskErrorModal: MatDialogRef<any>;
  constructor(
    @Inject(MAT_DIALOG_DATA) public trxData,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private web3Service: Web3Service,
    private dialog: MatDialog,
    private contractService: ContractsService,
    private userService: UserService,
  ) {
    this.web3Contract = this.web3Service.getContract(
      SWAPS_V2.ABI,
      SWAPS_V2.ADDRESS,
    );

    this.originalContract = this.route.snapshot.data.contract;

    this.updatePromise = true;

    this.copiedAddresses = {};
    this.analyzeContract();

    this.maximumInvestors = 10;

    this.currentUser = this.userService.getUserModel();
    this.userService
      .getCurrentUser()
      .subscribe((userProfile: UserInterface) => {
        this.currentUser = userProfile;
        this.checkAuthor();
      });
    this.checkAuthor();
    this.formatNumberParams = {
      groupSeparator: ',',
      groupSize: 3,
      decimalSeparator: '.',
    };

    const tokenInfo = this.originalContract.tokens_info;

    if (new Date(this.originalContract.created_date).getTime() < FIX_TIME) {
      tokenInfo.base.amount = new BigNumber(tokenInfo.base.amount)
        .div(Math.pow(10, tokenInfo.base.token.decimals))
        .toString();
      tokenInfo.quote.amount = new BigNumber(tokenInfo.quote.amount)
        .div(Math.pow(10, tokenInfo.quote.token.decimals))
        .toString();
    }

    this.rateFormat = {
      groupSeparator: ',',
      groupSize: 3,
      decimalSeparator: '.',
    };

    const baseAmount = new BigNumber(tokenInfo.base.amount);
    const quoteAmount = new BigNumber(tokenInfo.quote.amount);

    this.rates = {
      normal: baseAmount.div(quoteAmount),
      reverted: quoteAmount.div(baseAmount),
    };

    this.originalContract.unique_link_url = this.contractAdditional.link =
      location.origin + '/public-v3/' + this.originalContract.unique_link;

    this.checkCMCRate();
    this.countChecked = 0;
    this.isAuth = false;
    this.allowanceObj = {
      quote: {
        isAllowance: true,
        isAllowancing: false,
      },
      base: {
        isAllowance: true,
        isAllowancing: false,
      },
    };
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

  public cmcRate: {
    absCmcRange?: number;
    direct: number;
    revert: number;
    cmcRange?: number;
  };

  @ViewChild('administratorContact') administratorContact: TemplateRef<any>;

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

  private checkCMCRate() {
    const baseCoin = this.originalContract.tokens_info.base.token;
    const quoteCoin = this.originalContract.tokens_info.quote.token;

    if (
      baseCoin.cmc_id &&
      quoteCoin.cmc_id &&
      baseCoin.cmc_id > 0 &&
      quoteCoin.cmc_id > 0
    ) {
      this.cmcRate = {
        direct: new BigNumber(quoteCoin.rate).div(baseCoin.rate).toNumber(),
        revert: new BigNumber(baseCoin.rate).div(quoteCoin.rate).toNumber(),
      };
      this.cmcRate.cmcRange =
        this.rates.normal.toNumber() - this.cmcRate.direct;
      this.cmcRate.absCmcRange =
        Math.abs(-(this.rates.normal.toNumber() / this.cmcRate.direct - 1)) *
        100;
    } else {
      this.cmcRate = undefined;
    }
  }

  private checkSwapState() {
    const memo = this.originalContract.memo_contract;
    return new Promise((resolve, reject) => {
      const checkAfterActive = () => {
        this.web3Contract.methods
          .isSwapped(memo)
          .call()
          .then(
            (isSwapped) => {
              this.originalContract.isSwapped = isSwapped;
              if (isSwapped) {
                this.originalContract.state = this.originalContract.contract_state =
                  'DONE';
                resolve('DONE');
              } else {
                this.web3Contract.methods
                  .isCancelled(memo)
                  .call()
                  .then((isCancelled) => {
                    if (isCancelled) {
                      this.originalContract.state = this.originalContract.contract_state =
                        'CANCELLED';
                      resolve('CANCELLED');
                    } else {
                      this.originalContract.state = this.originalContract.contract_state =
                        'ACTIVE';
                      resolve('ACTIVE');
                    }
                  });
              }
            },
            (err) => {
              console.log(err);
            },
          );
      };

      if (this.originalContract.isEthereum) {
        if (
          this.originalContract.contract_state === 'CREATED' ||
          !this.originalContract.owner_address
        ) {
          this.web3Contract.methods
            .owners(memo)
            .call()
            .then(
              (address) => {
                if (
                  address &&
                  address !== '0x0000000000000000000000000000000000000000'
                ) {
                  this.originalContract.owner_address = address;
                  checkAfterActive();
                } else {
                  resolve(this.originalContract.state);
                }
              },
              (err) => {
                console.log(err);
              },
            );
        } else {
          checkAfterActive();
        }
      } else {
        resolve(this.originalContract.state);
      }
    });
  }

  private getBaseRaised() {
    const details = this.originalContract;
    const decimalsAmount = new BigNumber(details.tokens_info.base.amount).times(
      Math.pow(10, details.tokens_info.base.token.decimals),
    );

    if (details.isEthereum) {
      this.web3Contract.methods
        .baseRaised(details.memo_contract)
        .call()
        .then(
          (result) => {
            result = new BigNumber(result);
            this.contractInfo.baseRaised = result
              .div(Math.pow(10, details.tokens_info.base.token.decimals))
              .toString();
            this.contractInfo.baseLeft = decimalsAmount.minus(result);
            this.contractInfo.baseLeftString = this.contractInfo.baseLeft
              .div(Math.pow(10, details.tokens_info.base.token.decimals))
              .toString(10);
          },
          (err) => {
            console.log(err);
          },
        );
    } else {
      this.contractInfo.baseRaised = 0;
      this.contractInfo.baseLeft = decimalsAmount;
      this.contractInfo.baseLeftString = this.contractInfo.baseLeft
        .div(Math.pow(10, details.tokens_info.base.token.decimals))
        .toString(10);
    }
  }
  private getQuoteRaised() {
    const details = this.originalContract;
    const decimalsAmount = new BigNumber(
      details.tokens_info.quote.amount,
    ).times(Math.pow(10, details.tokens_info.quote.token.decimals));

    if (details.isEthereum) {
      this.web3Contract.methods
        .quoteRaised(details.memo_contract)
        .call()
        .then(
          (result) => {
            result = new BigNumber(result);
            this.contractInfo.quoteRaised = result
              .div(Math.pow(10, details.tokens_info.quote.token.decimals))
              .toString();
            this.contractInfo.quoteLeft = decimalsAmount.minus(result);

            this.contractInfo.quoteLeftString = this.contractInfo.quoteLeft
              .div(Math.pow(10, details.tokens_info.quote.token.decimals))
              .toString(10);
          },
          (err) => {
            console.log(err);
          },
        );
    } else {
      this.contractInfo.quoteRaised = 0;
      this.contractInfo.quoteLeft = decimalsAmount;
      this.contractInfo.quoteLeftString = this.contractInfo.quoteLeft
        .div(Math.pow(10, details.tokens_info.quote.token.decimals))
        .toString(10);
    }
  }
  private getBaseInvestors() {
    const details = this.originalContract;

    if (details.isEthereum) {
      this.web3Contract.methods
        .baseInvestors(details.memo_contract)
        .call()
        .then(
          (result) => {
            this.contractInfo.baseInvestors = result ? result.length : 0;
          },
          (err) => {
            this.contractInfo.baseInvestors = 0;
            // console.log(err);
          },
        );
    } else {
      this.contractInfo.baseInvestors = 0;
    }
  }
  private getQuoteInvestors() {
    const details = this.originalContract;
    if (details.isEthereum) {
      this.web3Contract.methods
        .quoteInvestors(details.memo_contract)
        .call()
        .then(
          (result) => {
            this.contractInfo.quoteInvestors = result ? result.length : 0;
          },
          (err) => {
            this.contractInfo.quoteInvestors = 0;
          },
        );
    } else {
      this.contractInfo.quoteInvestors = 0;
    }
  }
  private getBaseBrokersPercent() {
    const details = this.originalContract;

    if (details.isEthereum) {
      this.web3Contract.methods
        .myWishBasePercent()
        .call()
        .then(
          (result) => {
            this.contractInfo.baseBrokerPercent =
              result / 100 + details.broker_fee_base;
            this.contractInfo.baseBrokerAmount = new BigNumber(
              details.tokens_info.base.amount,
            )
              .div(100)
              .times(this.contractInfo.baseBrokerPercent)
              .toString();
          },
          (err) => {
            console.log(err);
          },
        );
    } else {
      this.contractInfo.baseBrokerPercent = details.broker_fee_base;
      this.contractInfo.baseBrokerAmount = new BigNumber(
        details.tokens_info.base.amount,
      )
        .div(100)
        .times(this.contractInfo.baseBrokerPercent)
        .toString();
    }
  }
  private getQuoteBrokersPercent() {
    const details = this.originalContract;

    if (details.isEthereum) {
      this.web3Contract.methods
        .myWishQuotePercent()
        .call()
        .then(
          (result) => {
            this.contractInfo.quoteBrokerPercent =
              result / 100 + details.broker_fee_quote;
            this.contractInfo.quoteBrokerAmount = new BigNumber(
              details.tokens_info.quote.amount,
            )
              .div(100)
              .times(this.contractInfo.quoteBrokerPercent)
              .toString();
          },
          (err) => {
            console.log(err);
          },
        );
    } else {
      this.contractInfo.quoteBrokerPercent = details.broker_fee_quote;
      this.contractInfo.quoteBrokerAmount = new BigNumber(
        details.tokens_info.quote.amount,
      )
        .div(100)
        .times(this.contractInfo.quoteBrokerPercent)
        .toString();
    }
  }

  private getContractInfoFromBlockchain() {
    const details = this.originalContract;
    this.getBaseRaised();
    this.getQuoteRaised();
    this.getBaseInvestors();
    this.getQuoteInvestors();

    this.getBaseBrokersPercent();
    this.getQuoteBrokersPercent();

    if (details.isEthereum) {
      if (details.contract_state === 'ACTIVE') {
        if (this.oldCheckedState !== details.contract_state) {
          this.web3Contract.methods
            .owners(details.memo_contract)
            .call()
            .then(
              (res) => {
                this.originalContract.owner_address = res;
              },
              (err) => {
                console.log(err);
              },
            );
        }

        this.web3Contract.methods
          .isSwapped(details.memo_contract)
          .call()
          .then(
            (res) => {
              this.originalContract.isSwapped = res;
            },
            (err) => {
              console.log(err);
            },
          );
      } else {
        this.originalContract.isSwapped = false;
      }
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
      }

      if (this.originalContract.state === 'ACTIVE') {
        this.updateContractTimer = setTimeout(() => {
          this.getBaseContract();
        }, 4000);
      }
    };

    if (
      this.originalContract.state === 'ACTIVE' ||
      this.originalContract.state === 'CREATED'
    ) {
      this.updatePromise = this.checkSwapState().then((state) => {
        getContractInfo();
      });
    } else {
      getContractInfo();
    }
  }

  private checkAuthor() {
    if (this.currentUser) {
      this.originalContract.isAuthor =
        this.currentUser.id === this.originalContract.user;
    }
  }

  private getBaseContract() {
    this.updatePromise = this.contractService
      .getSwapByPublic(this.originalContract.unique_link)
      .then((result) => {
        const tokens_info = this.originalContract.tokens_info;
        const swapped = this.originalContract.isSwapped;
        const state = this.originalContract.state;
        const contractState = this.originalContract.contract_state;
        const ownerAddress = this.originalContract.owner_address;
        const isAuthor = this.originalContract.isAuthor;
        const isEthereum = this.originalContract.isEthereum;

        this.originalContract = result;
        this.originalContract.tokens_info = tokens_info;
        this.originalContract.isSwapped = swapped;
        this.originalContract.state = state;
        this.originalContract.contract_state = contractState;
        this.originalContract.owner_address = ownerAddress;
        this.originalContract.isAuthor = isAuthor;
        this.originalContract.unique_link_url = this.contractAdditional.link;
        this.originalContract.isEthereum = isEthereum;
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

    const interfaceMethod = this.web3Service.getMethodInterface(
      'refund',
      SWAPS_V2.ABI,
    );
    const methodSignature = this.web3Service.encodeFunctionCall(
      interfaceMethod,
      [details.memo_contract, token.address],
    );

    const sendTransaction = (wallet?) => {
      return this.web3Service.sendTransaction(
        {
          from: wallet,
          to: SWAPS_V2.ADDRESS,
          data: methodSignature,
        },
        'metamask',
      );
    };

    window['ethereum'].enable().then((accounts) => {
      const address = accounts[0];
      sendTransaction(address);
    });
  }

  public sendCancel() {
    const details = this.originalContract;

    if (!details.isEthereum) {
      this.contractService.cancelSWAP3(details.id).then((result) => {
        console.log(result);
      });
      return;
    }

    const cancelMethod = this.web3Service.getMethodInterface(
      'cancel',
      SWAPS_V2.ABI,
    );
    const cancelSignature = this.web3Service.encodeFunctionCall(cancelMethod, [
      details.memo_contract,
    ]);

    const cancelTransaction = (wallet) => {
      return this.web3Service.sendTransaction(
        {
          from: wallet,
          to: SWAPS_V2.ADDRESS,
          data: cancelSignature,
        },
        'metamask',
      );
    };

    window['ethereum'].enable().then((accounts) => {
      const address = accounts[0];
      cancelTransaction(address);
    });
  }

  public initialisationTrade() {
    const details = this.originalContract;

    const interfaceMethod = this.web3Service.getMethodInterface(
      'createOrder',
      SWAPS_V2.ABI,
    );

    let baseDecimalsTimes = 1;
    let quoteDecimalsTimes = 1;

    if (new Date(this.originalContract.created_date).getTime() > FIX_TIME) {
      baseDecimalsTimes = Math.pow(10, details.tokens_info.base.token.decimals);
      quoteDecimalsTimes = Math.pow(
        10,
        details.tokens_info.quote.token.decimals,
      );
    }

    const trxRequest = [
      details.memo_contract,
      details.tokens_info.base.token.address,
      details.tokens_info.quote.token.address,
      new BigNumber(details.base_limit || '0')
        .times(baseDecimalsTimes)
        .toString(10),
      new BigNumber(details.quote_limit || '0')
        .times(quoteDecimalsTimes)
        .toString(10),
      Math.round(new Date(details.stop_date).getTime() / 1000).toString(10),
      details.whitelist
        ? details.whitelist_address
        : '0x0000000000000000000000000000000000000000',
      new BigNumber(details.min_base_wei || '0')
        .times(baseDecimalsTimes)
        .toString(10),
      new BigNumber(details.min_quote_wei || '0')
        .times(quoteDecimalsTimes)
        .toString(10),
      details.broker_fee
        ? details.broker_fee_address
        : '0x0000000000000000000000000000000000000000',
      details.broker_fee
        ? new BigNumber(details.broker_fee_base).times(100).toString(10)
        : '0',
      details.broker_fee
        ? new BigNumber(details.broker_fee_quote).times(100).toString(10)
        : '0',
    ];

    const activateSignature = this.web3Service.encodeFunctionCall(
      interfaceMethod,
      trxRequest,
    );
    window['ethereum'].enable().then((accounts) => {
      const address = accounts[0];
      sendActivateTrx(address);
    });
    const sendActivateTrx = (wallet?) => {
      return this.web3Service.sendTransaction(
        {
          from: wallet,
          to: SWAPS_V2.ADDRESS,
          data: activateSignature,
        },
        'metamask',
      );
    };
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
    }

    const stringAmountValue = new BigNumber(amount)
      .times(Math.pow(10, tokenModel.token.decimals))
      .toString(10);

    let value: string;
    if (tokenModel.token.isEther) {
      value = stringAmountValue;
    }

    const depositMethod = this.web3Service.getMethodInterface(
      'deposit',
      SWAPS_V2.ABI,
    );
    const depositSignature = this.web3Service.encodeFunctionCall(
      depositMethod,
      [details.memo_contract, tokenModel.token.address, stringAmountValue],
    );

    const contributeTransaction = (wallet) => {
      return this.web3Service.sendTransaction(
        {
          from: wallet.address,
          to: SWAPS_V2.ADDRESS,
          data: depositSignature,
          value: value || undefined,
        },
        wallet.type,
      );
    };

    return {
      action: contributeTransaction,
      signature: depositSignature,
      token: tokenModel.token,
    };
  }

  public sendTransaction(wallet, transaction) {
    if (this.metamaskError) {
      switch (this.metamaskError.code) {
        case 3:
          this.getAccountsSubscriber.unsubscribe();
          this.updateAddresses(
            false,
            (address) => {
              this.sendTransaction(
                {
                  type: 'metamask',
                  address,
                },
                transaction,
              );
            },
            transaction,
          );
          break;
        default:
          this.metaMaskErrorModal = this.dialog.open(this.metaMaskError, {
            width: '480px',
            panelClass: 'custom-dialog-container',
          });
      }
      return;
    }

    if (transaction.onlyOwner && wallet.address !== transaction.onlyOwner) {
      this.metamaskError = {
        msg:
          'This address is not authorized for the operation. Please choose another address in MetaMask.',
      };
      this.metaMaskErrorModal = this.dialog.open(this.metaMaskError, {
        width: '480px',
        panelClass: 'custom-dialog-container',
      });

      this.metaMaskErrorModal.afterClosed().subscribe(() => {
        this.metamaskError = false;
      });
      return;
    }

    transaction.inProgress = true;

    transaction
      .action(wallet)
      .then((result) => {
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

  private checkAllChecked(forceCheck?) {
    this.countChecked++;
    if (this.countChecked === this.trxData.transactions.length || forceCheck) {
      this.trxData.checked = true;
    }
  }

  ngOnDestroy(): void {
    if (this.updateContractTimer) {
      window.clearTimeout(this.updateContractTimer);
    }
    this.updatePromise = false;
    // this.getAccountsSubscriber.unsubscribe();
  }

  public openContactForm() {
    this.dialog.open(ContactOwnerComponent, {
      width: '38.65em',
      panelClass: 'custom-dialog-container',
      data: this.originalContract,
    });
  }

  public quoteWillGetValue(amount) {
    const details = this.originalContract;

    const quoteWillValue = new BigNumber(amount).times(
      new BigNumber(details.tokens_info.quote.amount).div(
        new BigNumber(details.tokens_info.base.amount),
      ),
    );

    const quoteFeeValue = quoteWillValue
      .div(100)
      .times(this.contractInfo.quoteBrokerPercent);

    if (!quoteFeeValue.isNaN()) {
      return quoteWillValue.minus(quoteFeeValue).toString(10);
    } else {
      return quoteWillValue.toString(10);
    }
  }

  public baseWillGetValue(amount) {
    const details = this.originalContract;
    const baseWillValue = new BigNumber(amount).times(
      new BigNumber(details.tokens_info.base.amount).div(
        new BigNumber(details.tokens_info.quote.amount),
      ),
    );

    const baseFeeValue = baseWillValue
      .div(100)
      .times(this.contractInfo.baseBrokerPercent);

    if (!baseFeeValue.isNaN()) {
      return baseWillValue.minus(baseFeeValue).toString(10);
    } else {
      return baseWillValue.toString(10);
    }
  }

  private openAdministratorInfo() {
    this.dialog.open(this.administratorContact, {
      width: '480px',
      panelClass: 'custom-dialog-container',
    });
  }

  public sendContribute(amount, token) {
    try {
      this.amount = amount;
      this.token = token;
      const details = this.originalContract;

      if (!details.isEthereum) {
        this.openAdministratorInfo();
        return;
      }

      if (details.contract_state === 'CREATED') {
        this.initialisationTrade();
        return;
      }

      this.createTransactions(amount, token);
    } catch (err) {
      console.log(err);
    }
  }

  private checkAllowance = (wallet, token, amount) => {
    return new Promise((resolve, reject) => {
      const tokenModel = this.originalContract.tokens_info[token].token;
      this.tokenContract = this.web3Service.getContract(
        ERC20_TOKEN_ABI,
        tokenModel.address,
      );
      this.tokenContract.methods
        .allowance(wallet, SWAPS_V2.ADDRESS)
        .call()
        .then(
          (result) => {
            result = result ? result.toString(10) : result;
            result = result === '0' ? null : result;
            if (result && new BigNumber(result).minus(amount).isPositive()) {
              resolve(true);
            } else {
              reject(false);
            }
          },
          () => {
            reject(false);
          },
        );
    });
  };
  private createTransactions(amount, token) {
    try {
      if (isNaN(amount)) {
        return;
      }

      const contributeData = this.getContributeTransaction(amount, token);
      const textAmount = amount;

      const approveMethod = this.web3Service.getMethodInterface('approve');
      const approveSignature = this.web3Service.encodeFunctionCall(
        approveMethod,
        [
          SWAPS_V2.ADDRESS,
          new BigNumber(90071992.5474099)
            .times(Math.pow(10, Math.max(contributeData.token.decimals, 7)))
            .toString(10),
        ],
      );

      const approveTransaction = (wallet) => {
        return this.web3Service.sendTransaction(
          {
            from: wallet.address,
            to: contributeData.token.address,
            data: approveSignature,
          },
          wallet.type,
        );
      };
      this.updateAddresses(true);

      let transaction: any = {
        title:
          'Make the transfer of ' +
          textAmount +
          ' ' +
          contributeData.token.token_short_name +
          ' tokens to contract',
        to: SWAPS_V2.ADDRESS,
        data: contributeData.signature,
        action: contributeData.action,
        ethValue: !contributeData.token.isEther ? undefined : textAmount,
      };

      if (!contributeData.token.isEther) {
        window['ethereum'].enable().then((accounts) => {
          return new Promise((resolve, _) => {
            const address = accounts[0];
            if (!this.allowanceObj[token].isAllowance) {
              this.allowanceObj[token].isAllowancing = true;
            }
            this.checkAllowance(address, token, amount)
              .then((status) => {
                this.createTransactionObj(transaction);
              })
              .catch(() => {
                transaction = {
                  title:
                    'Authorise the contract for getting ' +
                    contributeData.token.token_short_name +
                    ' tokens',
                  to: contributeData.token.address,
                  data: approveSignature,
                  checkComplete: this.checkAllowance,
                  action: approveTransaction,
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
    window['ethereum'].enable().then((accounts) => {
      const address = accounts[0];
      this.sendTransaction(
        {
          type: 'metamask',
          address,
        },
        transaction,
      );
    });
  }

  private updateAddresses(ifEnabled?, cb?, transaction?) {
    this.getAccountsSubscriber = this.web3Service
      .getAccounts(false, ifEnabled)
      .subscribe(
        (addresses: any) => {
          this.metamaskError = false;
          this.providedAddresses = addresses;
          if (cb) {
            cb(addresses.metamask[0]);
          }
          if (
            transaction.checkComplete &&
            addresses.metamask &&
            addresses.metamask[0]
          ) {
            transaction
              .checkComplete(addresses.metamask[0], this.token, this.amount)
              .then(
                (result) => {
                  if (result) {
                    transaction.confirmed = true;
                    this.checkAllChecked();
                  }
                },
                (err) => {
                  this.checkAllChecked();
                },
              );
          } else {
            this.checkAllChecked();
          }
        },
        (error) => {
          this.metamaskError = error;
          this.checkAllChecked(true);
        },
      );

    return this.getAccountsSubscriber;
  }
  ngOnInit() {
    const tokens = ['base', 'quote'];
    tokens.forEach((token) => {
      const contributeData = this.getContributeTransaction(0, token);

      window['ethereum'].enable().then((accounts) => {
        const address = accounts[0];

        if (!contributeData.token.isEther) {
          this.checkAllowance(address, token, 0).catch(() => {
            this.allowanceObj[token].isAllowance = false;
          });
        }
      });
    });
  }
}
