import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  AfterContentInit,
  TemplateRef,
  ViewChild,
  Output, Injectable, ElementRef, AfterViewInit,
} from '@angular/core';
import { SWAPS_V2 } from '../../contracts-preview-v3/contracts-preview-v3.component';
import { Web3Service } from '../../services/web3/web3.service';
import { UserService } from '../../services/user/user.service';
import BigNumber from 'bignumber.js';
import {Router, ActivatedRoute, Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {CHAIN_OF_NETWORK, ERC20_TOKEN_ABI} from '../../services/web3/web3.constants';
import { ContractsService } from '../../services/contracts/contracts.service';
import * as moment from 'moment';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatDialog,
  MatDialogRef,
} from '@angular/material';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';

import {OneInchService} from "../../models/1inch/1inch";
import {HttpService} from "../../services/http/http.service";
import {Observable} from "rxjs";

const defaultNetwork = 1;

export interface IContractDetails {
  network?: number;
  base_address?: string;
  quote_address?: string;
  base_limit?: string;
  quote_limit?: string;
  stop_date?: number;
  owner_address?: string;
  permanent?: boolean | false;
  public?: boolean | undefined;
  unique_link?: string;
  unique_link_url?: string;
  eth_contract?: any;

  broker_fee?: boolean;
  broker_fee_address?: string;
  broker_fee_base?: number;
  broker_fee_quote?: number;

  tokens_info?: {
    base: {
      token: any;
      amount?: string;
    };
    quote: {
      token: any;
      amount?: string;
    };
  };

  whitelist?: any;
  whitelist_address?: any;
  min_base_wei?: any;
  memo_contract?: any;
  min_quote_wei?: any;
}
export const MY_FORMATS = {
  useUtc: true,
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'X',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-start-form',
  templateUrl: './start-form.component.html',
  styleUrls: ['./start-form.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class StartFormComponent implements OnInit, OnDestroy, AfterContentInit {
  @ViewChild('metaMaskError') metaMaskError: TemplateRef<any>;
  @ViewChild('insufficientFundsError') insufficientFundsError: TemplateRef<any>;
  @ViewChild('container') container: ElementRef;
  @Output() BaseTokenCustom = new EventEmitter<any>();
  @Output() QuoteTokenCustom = new EventEmitter<any>();
  @Output() changedSocialState = new EventEmitter<string>();
  @Output() instanceTradesSelect = new EventEmitter<any>();
  @Output() blockchainTradesSelect = new EventEmitter<any>();
  public currentUser;
  public cmcRate: {
    change?: number;
    isMessage?: boolean;
    isLower?: boolean;
    direct: number;
    revert: number;
  };
  private CMCRates;
  private metaMaskErrorModal: MatDialogRef<any>;
  public blockchainsOfNetworks = {
    1: 'ethereum',
    22: 'binance',
    24: 'matic'
  };

  public instantTradesAvailable: boolean = true;
  public instanceTrade: boolean = true;
  private instanceTradeParams: any = {};


  public instanceTradesTokens: any[];

  public serviceAvailable: boolean = !!(window['cmc_tokens'] && window['cmc_tokens'].length);

  public instantTradeInProgress: boolean = false;

  constructor(
    private dialog: MatDialog,
    protected contractsService: ContractsService,
    private web3Service: Web3Service,
    protected router: Router,
    private userService: UserService,
    private route: ActivatedRoute,
    private oneInchService: OneInchService
  ) {
    this.CMCRates = {};
    this.currentUser = this.userService.getUserModel();
    this.userService.getCurrentUser().subscribe((userProfile: any) => {
      this.currentUser = userProfile;
    });
    this.sendData = {
      contract_type: 20
    };
    this.tokensData = {
      base: {
        token: {},
        customToken: false,
      },
      quote: {
        token: {},
        customToken: false,
      },
    };
    this.isAdvSettingsOpen = false;
    this.openedCustomTokens = {
      base: false,
      quote: false,
    };

    this.customTokens = {
      base: {},
      quote: {},
    };

    this.minDate = moment().add(1, 'hour');
    const startDateTime = moment(this.minDate);

    this.datePickerDate = startDateTime.add(1, 'week');
    this.datePickerTime = `${startDateTime.hour()}:${startDateTime.minutes()}`;
    this.isCreatingContract = false;

    this.instanceTradesTokens = this.oneInchService.getAutocompleteTokensList();

  }

  private checkQueryParams() {
    const tokens = this.route.snapshot.data.checkedTokens;
    tokens.forEach((t, i) => {
      if (t) {
        this.addCustomToken(i ? 'quote' : 'base', t);
      }
    });
    if (tokens[0] && tokens[1]) {
      this.requestData.tokens_info.base.amount = '1';
    }
    this.changedToken(true);
  }


  private socialFormData: {
    network: string;
    data: any;
  };
  public isCreatingContract;
  public socialAuthError;
  public tokensData;
  public isAdvSettingsOpen;

  public minTime;
  public minDate: moment.Moment;

  public datePickerDate;
  public datePickerTime;

  public customTokens;

  public openedCustomTokens: {
    base: boolean;
    quote: boolean;
  };

  public requestData: IContractDetails;

  protected sendData;

  public formIsSending: boolean;

  @ViewChild('startForm') public startForm;
  @ViewChild('advSettings') public advSettings;

  public isChangedToken(...args) {
    localStorage.setItem(
      'form_new_values',
      JSON.stringify({ tokens_info: this.tokensData })
    );
  }


  public getRate(revert?): string {
    if (
      !(
        this.requestData.tokens_info.base.amount &&
        this.requestData.tokens_info.quote.amount
      )
    ) {
      return '0';
    }

    const baseCoinAmount = new BigNumber(
      this.requestData.tokens_info.base.amount
    );
    const quoteCoinAmount = new BigNumber(
      this.requestData.tokens_info.quote.amount
    );
    return (!revert
      ? baseCoinAmount.div(quoteCoinAmount)
      : quoteCoinAmount.div(baseCoinAmount)
    ).toString();
  }

  public getInstanceQuoteProgress = false;
  public getInstanceQuoteTimeout: any;

  public checkInstancePrice() {
    const params = this.getOrderParams();
    if (!(+params.amount > 0)) {
      return;
    }
    const quoteDecimalsTimes = Math.pow(10, this.requestData.tokens_info.quote.token.decimals);
    this.getInstanceQuoteProgress = true;
    if (this.getInstanceQuoteTimeout) {
      clearTimeout(this.getInstanceQuoteTimeout);
    }

    this.getInstanceQuoteTimeout = setTimeout(() => {
      this.oneInchService.getQuote(
          params,
          !this.instantTradesAvailable ? this.requestData.tokens_info.quote.token.address : false
      ).then((result: any) => {
        this.instanceTradeParams = result;
        this.requestData.tokens_info.quote.amount =
        Number(result.toTokenAmount) ?
            new BigNumber(result.toTokenAmount).div(quoteDecimalsTimes).toString(10) : '';
        // this.QuoteTokenCustom.emit();
        this.getInstanceQuoteProgress = false;
      });
    }, 1000);
  }


  private tokensCache = {
    quote: '',
    base: '',
    baseAmount: ''
  };

  private checkAndGetInstanceQuote(force?: boolean) {
    const baseCoin = this.requestData.tokens_info.base.token;
    const quoteCoin = this.requestData.tokens_info.quote.token;

    const identical = this.tokensCache.base === baseCoin.address && this.tokensCache.quote === quoteCoin.address;
    if (identical) {
      this.requestData.tokens_info.quote.amount = '';
    }
    if (!identical || force) {
      this.tokensCache.base = baseCoin.address;
      this.tokensCache.quote = quoteCoin.address;
      if (baseCoin.address && quoteCoin.address && baseCoin.address !== quoteCoin.address && this.requestData.network === 1) {
        this.instantTradesAvailable = this.oneInchService.checkTokensPair(baseCoin, quoteCoin);
      } else {
        this.instantTradesAvailable = false;
      }
    }

    if (!identical || force || (this.tokensCache.baseAmount !== this.requestData.tokens_info.base.amount)) {
      this.checkInstancePrice();
      this.tokensCache.baseAmount = this.requestData.tokens_info.base.amount;
    } else {
      const quoteDecimalsTimes = Math.pow(10, this.requestData.tokens_info.quote.token.decimals);
      this.requestData.tokens_info.quote.amount = new BigNumber(
          this.instanceTradeParams.toTokenAmount
      ).div(quoteDecimalsTimes).toString(10);
      // this.QuoteTokenCustom.emit();
    }
  }

  public changedToken(force?: boolean) {
    const baseCoin = this.requestData.tokens_info.base.token;
    const quoteCoin = this.requestData.tokens_info.quote.token;
    if (this.instanceTrade) {
      if (!quoteCoin.address) {
        this.requestData.tokens_info.quote.amount = '';
      } else {
        this.checkAndGetInstanceQuote(force);
      }
    }


    if (
      this.requestData.tokens_info.base.amount &&
      this.requestData.tokens_info.quote.amount &&
      baseCoin.cmc_id &&
      quoteCoin.cmc_id &&
      baseCoin.cmc_id > 0 &&
      quoteCoin.cmc_id > 0
    ) {
      this.cmcRate = {
        revert: new BigNumber(baseCoin.rate).div(quoteCoin.rate).toNumber(),
        direct: new BigNumber(quoteCoin.rate).div(baseCoin.rate).toNumber(),
      };
      const rate = parseFloat(this.getRate(true));
      const rateChanges = parseFloat(this.getRate()) - this.cmcRate.direct;
      this.cmcRate.isMessage = true;
      this.cmcRate.isLower = rateChanges > 0;
      this.cmcRate.change = Math.round(
        Math.abs(-(rate / this.cmcRate.revert - 1)) * 100
      );
    } else {
      this.cmcRate = undefined;
    }
  }

  public toogleAdvSettings() {
    this.isAdvSettingsOpen = !this.isAdvSettingsOpen;
  }

  private onInit = false;

  ngOnInit() {
    this.setNetwork(1);
    this.onInit = true;
    this.checkQueryParams();
  }

  public resetFormEmitter = new EventEmitter();

  private resetStartForm(network?) {
    this.requestData = {
      tokens_info: {
        base: {
          token: {},
        },
        quote: {
          token: {},
        },
      },
      network: network || defaultNetwork,
      public: true,
      permanent: false,
      broker_fee_base: 0.1,
      broker_fee_quote: 0.1,
    };
    this.customTokens = {
      base: {},
      quote: {},
    };

    if (this.onInit) {
      this.BaseTokenCustom.emit(false);
      this.QuoteTokenCustom.emit(false);
      this.startForm.resetForm();
      this.startForm.form.reset();
      this.resetFormEmitter.emit();
    }
  }

  public selectedNetwork;

  public setNetwork(network) {
    this.resetStartForm(network);
    this.selectedNetwork = network
    if (network !== 1) {
      this.instanceTrade = false;
    }
    this.instanceTradesSelect.emit(this.instanceTrade);
    this.blockchainTradesSelect.emit(network);
  }

  public activateInstanceTrade() {
    if (this.instanceTrade) {
      return;
    }
    this.instanceTrade = true;
    this.instanceTradesSelect.emit(true);
    const baseCoin = this.requestData.tokens_info.base.token;
    const quoteCoin = this.requestData.tokens_info.quote.token;
    const isBase = this.oneInchService.checkToken(baseCoin);
    const isQuote = this.oneInchService.checkToken(quoteCoin);
    /*if (!isBase) {
      this.requestData.tokens_info.base = {
        token: {},
      };
    }
    if (!isQuote) {
      this.requestData.tokens_info.quote = {
        token: {},
      };
    }*/
    if (isBase && isQuote) {
      this.changedToken(true);
    }
  }

  public deActivateInstanceTrade() {
    if (!this.instanceTrade) {
      return;
    }
    this.instanceTrade = false;
    this.instanceTradesSelect.emit(false);

    const baseCoin = this.requestData.tokens_info.base.token;
    const quoteCoin = this.requestData.tokens_info.quote.token;

    const cmcBaseToken = window['cmc_tokens'].find((t) => {
      return t.token_short_name === baseCoin.token_short_name &&
          t.address.toLowerCase() === baseCoin.address.toLowerCase();
    });
    const cmcQuoteToken = window['cmc_tokens'].find((t) => {
      return t.token_short_name === quoteCoin.token_short_name &&
          t.address.toLowerCase() === quoteCoin.address.toLowerCase();
    });

    if (!cmcBaseToken) {
      this.requestData.tokens_info.base = {
        token: {},
      };
    }
    if (!cmcQuoteToken) {
      this.requestData.tokens_info.quote = {
        token: {},
      };
    }
  }

  ngOnDestroy(): void {
    this.isChangedToken();
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.setFullDateTime();
    });
  }

  public dateChange() {
    if (this.advSettings.value.active_to.isSame(this.minDate, 'day')) {
      this.minTime = `${this.minDate.hour()}:${this.minDate.minutes()}`;
    } else {
      this.minTime = null;
    }
    this.setFullDateTime();
  }

  public timeChange() {
    this.setFullDateTime();
  }

  public changePD() {
    if (
      this.requestData.tokens_info.base.token.token_name &&
      this.requestData.tokens_info.quote.token.token_name
    ) {
      this.requestData.public = this.requestData.public;

      console.log('requestData.public', this.requestData.public);
    }
  }

  private setFullDateTime() {
    const times = this.advSettings.value.time.split(':');
    this.advSettings.value.active_to.hour(times[0]);
    this.advSettings.value.active_to.minutes(times[1]);

    if (this.advSettings.value.active_to.isBefore(this.minDate)) {
      this.advSettings.controls.time.setErrors({ incorrect: true });
    } else {
      this.advSettings.controls.time.setErrors(null);
    }
    setTimeout(() => {
      this.requestData.stop_date = this.advSettings.value.active_to.clone();
    });
  }

  public setCustomToken(field, token) {
    this.customTokens[field] = token;
  }

  get baseBrokerFee() {
    if (
      !(
        this.requestData.tokens_info.base.amount &&
        this.requestData.broker_fee_base
      )
    ) {
      return 0;
    }
    return new BigNumber(this.requestData.tokens_info.base.amount)
      .div(100)
      .times(this.requestData.broker_fee_base)
      .toString();
  }

  get quoteBrokerFee() {
    if (!(this.requestData.tokens_info.quote.amount && this.requestData.broker_fee_quote)) {
      return 0;
    }
    return new BigNumber(this.requestData.tokens_info.quote.amount)
      .div(100)
      .times(this.requestData.broker_fee_quote)
      .toString();
  }

  public addCustomToken(name, token?) {
    this.requestData.tokens_info[name].token = { ...(token || this.customTokens[name]) };
    switch (name) {
      case 'base':
        this.BaseTokenCustom.emit(this.requestData.tokens_info[name]);
        break;
      case 'quote':
        this.QuoteTokenCustom.emit(this.requestData.tokens_info[name]);
        break;
    }
    this.openedCustomTokens[name] = false;
  }

  private buildAndCreate() {
    this.sendData.network = this.requestData.network;
    this.sendData.stop_date = this.advSettings.value.active_to
        .clone()
        .utc()
        .format('YYYY-MM-DD HH:mm');

    this.sendData.base_limit = this.requestData.tokens_info.base.amount;
    this.sendData.quote_limit = this.requestData.tokens_info.quote.amount;

    this.sendData.name =
        this.requestData.tokens_info.base.token.token_short_name +
        ' <> ' +
        this.requestData.tokens_info.quote.token.token_short_name;

    this.sendData.base_address = this.requestData.tokens_info.base.token.address;
    this.sendData.quote_address = this.requestData.tokens_info.quote.token.address;

    this.sendData.base_coin_id = this.requestData.tokens_info.base.token.mywish_id;
    this.sendData.quote_coin_id = this.requestData.tokens_info.quote.token.mywish_id;

    this.sendData.public = this.requestData.public;
    this.sendData.permanent = this.requestData.permanent;

    this.sendData.notification = false;

    this.sendData.min_quote_wei = this.requestData.min_quote_wei || '0';
    this.sendData.min_base_wei = this.requestData.min_base_wei || '0';
    this.sendData.rubic_initialized = false;

    if (!this.requestData.broker_fee) {
      this.requestData.broker_fee_address = null;
      this.requestData.broker_fee_base = null;
      this.requestData.broker_fee_quote = null;
    } else {
      this.sendData.broker_fee_address = this.requestData.broker_fee_address;
      this.sendData.broker_fee = this.requestData.broker_fee;
      this.sendData.broker_fee_base = this.requestData.broker_fee_base;
      this.sendData.broker_fee_quote = this.requestData.broker_fee_quote;
    }

    if (this.currentUser.is_ghost) {
      this.MetamaskAuth();
    } else {
      this.isCreatingContract = true;
      this.sendContractData(this.sendData);
    }
  }

  private getOrderParams() {

    const baseCoin = this.requestData.tokens_info.base.token;
    const quoteCoin = this.requestData.tokens_info.quote.token;
    const params = {} as any;
    params.fromTokenSymbol = baseCoin.token_short_name;
    params.toTokenSymbol = quoteCoin.token_short_name;
    const baseDecimalsTimes = Math.pow(10, this.requestData.tokens_info.base.token.decimals);
    params.amount = new BigNumber(this.requestData.tokens_info.base.amount).times(baseDecimalsTimes).toString(10);
    return params;
  }

  private async createInstanceTrade() {
    const params = this.getOrderParams();
    params.fromAddress = this.metamaskAccount;
    this.getInstanceQuoteProgress = true;



    const remoteContractAddress = (await this.oneInchService.getApproveSpender() as any).address;
    const baseToken = this.requestData.tokens_info.base.token;
    if (baseToken.token_short_name !== 'ETH') {
      let error;
      await this.check1InchAllowance(remoteContractAddress, params).catch(e => {
        console.log(e);
        this.getInstanceQuoteProgress = false;
        this.instantTradeInProgress = false;
        error = true;
      });
      if (error) {
        return;
      }
    }
    this.oneInchService.getSwap(params, this.instanceTradeParams)
      .then((result: any) => {
        const gasIncreasedTx= { ...result.tx, gas: result.tx * 1.25}
        this.web3Service.sendTransaction(gasIncreasedTx, this.requestData.network, () => this.instantTradeInProgress = true)
            .then((res: any) => {
              this.resetStartForm();
              const win = window.open('https://etherscan.io/tx/' + res.transactionHash, 'target=_blank');
            }, () => {})
            .finally(() => {
              this.getInstanceQuoteProgress = false;
              this.instantTradeInProgress = false;
            });
      })
      .catch(e => {
        console.log(e);
        this.metaMaskErrorModal = this.dialog.open(this.insufficientFundsError, {
          width: '480px',
          panelClass: 'custom-dialog-container',
        });
        this.getInstanceQuoteProgress = false;
        this.instantTradeInProgress = false;
      });
  }

  private async check1InchAllowance(remoteContractAddress, params) {
    const baseToken = this.requestData.tokens_info.base.token;
    let tokenContract = this.web3Service.getContract(
        ERC20_TOKEN_ABI,
        baseToken.address,
        this.requestData.network
    );
    const sendApproveTx = () => {
      const approveMethod = this.web3Service.getMethodInterface('approve');
      const approveSignature = this.web3Service.encodeFunctionCall(
          approveMethod,
          [
            remoteContractAddress,
            params.amount.toString(10),
          ],
      );

      return this.web3Service.sendTransaction(
          {
            from: this.metamaskAccount,
            to: baseToken.address,
            data: approveSignature,
          },
          this.requestData.network,
          () => this.instantTradeInProgress = true
      );
    };
    return tokenContract.methods
        .allowance(this.metamaskAccount, remoteContractAddress)
        .call()
        .then((result) => {
          result = new BigNumber(result);
          const noAllowance = result.minus(params.amount).isNegative();
          if (noAllowance) {
            return sendApproveTx();
          }
        })
  }

  private metamaskAccount: string;

  public createContract() {
    const accSubscriber = this.updateAddresses(true).subscribe((res) => {
      this.metamaskAccount = res['metamask'][0];

      if (this.instanceTrade && this.instantTradesAvailable) {
        this.createInstanceTrade();
      } else if(!this.instanceTrade) {
        this.buildAndCreate();
      }
    }, (err) => {
      this.metaMaskErrorModal = this.dialog.open(this.metaMaskError, {
        width: '480px',
        panelClass: 'custom-dialog-container',
      });
    }, () => {
      accSubscriber.unsubscribe();
    });
  }

  private sendMetaMaskRequest(data) {
    this.socialFormData = {
      network: 'mm',
      data,
    };
    this.userService.metaMaskAuth(data).then(
      (result) => {
        this.sendContractData(this.sendData);
      },
      (error) => {
        this.onTotpError(error);
      }
    );
  }

  private onTotpError(error) {
    switch (error.status) {
      case 403:
        this.socialAuthError = error.error.detail;
        switch (error.error.detail) {
          case '1032':
          case '1033':
            this.changedSocialState.emit(error.error.detail);
            break;
        }
        break;
    }
  }

  public MetamaskAuth() {
    if (window['ethereum'] && window['ethereum'].isMetaMask) {
      window['ethereum'].enable().then((accounts) => {
        const address = accounts[0];
        this.userService.getMetaMaskAuthMsg().then((msg) => {
          this.web3Service.getSignedMetaMaskMsg(msg, address).then((signed) => {
            this.sendMetaMaskRequest({
              address,
              msg,
              signed_msg: signed,
            });
          });
        });
      });
    }
  }

  protected sendContractData(data) {
    if (this.formIsSending) {
      return;
    }
    this.formIsSending = true;

    if (window['dataLayer']) {
      window['dataLayer'].push({ event: 'publish' });
    }

    this.contractsService[data.id ? 'updateSWAP3' : 'createSWAP3'](data)
      .then(
        (result) => {
          !data.id
            ? this.initialisationTrade(result)
            : this.contractIsCreated(result);
        },
        (err) => {
          console.log(err);
        }
      )
      .finally(() => {
        this.formIsSending = false;
      });
  }

  private contractIsCreated(contract) {
    this.router.navigate(['/public-v3/' + contract.unique_link]);
  }

  public initialisationTrade(originalContract) {
    const details = originalContract;
    const interfaceMethod = this.web3Service.getMethodInterface('createOrder', SWAPS_V2.ABI);

    const baseDecimalsTimes = Math.pow(10, this.requestData.tokens_info.base.token.decimals);
    const quoteDecimalsTimes = Math.pow(10, this.requestData.tokens_info.quote.token.decimals);

    const trxRequest = [
      details.memo_contract,
      this.requestData.tokens_info.base.token.address,
      this.requestData.tokens_info.quote.token.address,
      new BigNumber(details.base_limit || '0').times(baseDecimalsTimes).toString(10),
      new BigNumber(details.quote_limit || '0').times(quoteDecimalsTimes).toString(10),
      Math.round(new Date(details.stop_date).getTime() / 1000).toString(10),
      details.whitelist ? details.whitelist_address : '0x0000000000000000000000000000000000000000',
      new BigNumber(details.min_base_wei || '0').times(baseDecimalsTimes).toString(10),
      new BigNumber(details.min_quote_wei || '0').times(quoteDecimalsTimes).toString(10),
      details.broker_fee ? details.broker_fee_address : '0x0000000000000000000000000000000000000000',
      details.broker_fee ? new BigNumber(details.broker_fee_base).times(100).toString(10) : '0',
      details.broker_fee ? new BigNumber(details.broker_fee_quote).times(100).toString(10) : '0',
    ];

    const activateSignature = this.web3Service.encodeFunctionCall(
      interfaceMethod,
      trxRequest
    );
    const sendActivateTrx = (wallet?) => {
      const contractAddress = SWAPS_V2.ADDRESSES[CHAIN_OF_NETWORK[this.sendData.network]];
      return this.web3Service
        .sendTransaction(
          {
            from: wallet,
            to: contractAddress,
            data: activateSignature,
          },
          this.sendData.network
        )
        .then(() => {
          this.sendData.id = details.id;
          this.sendData.rubic_initialized = true;
          this.sendContractData(this.sendData);
        })
        .catch((err) => {
          this.isCreatingContract = false;
        });
    };
    return sendActivateTrx();
  }

  public closeMetaMaskError() {
    this.metaMaskErrorModal.close();
  }

  private updateAddresses(ifEnabled?) {
    return this.web3Service.getAccounts(false, ifEnabled, this.requestData.network);
  }

  public revertCoins():void {
    const baseToken = this.requestData.tokens_info.base;
    this.requestData.tokens_info.base = this.requestData.tokens_info.quote;
    this.requestData.tokens_info.quote = baseToken;
    this.BaseTokenCustom.emit(this.requestData.tokens_info[name]);
    this.QuoteTokenCustom.emit(this.requestData.tokens_info[name]);
  }

}



@Injectable()
export class StartFormResolver implements Resolve<any> {

  private ethTokens: any[] = window['cmc_tokens'].filter((t) => {
    return t.platform === 'ethereum';
  });

  constructor(
      private web3Service: Web3Service,
  ) {

  }

  private getTokenPromise(token_symbol) {
    const token = token_symbol ? this.ethTokens.find((exToken) => {
      return token_symbol === exToken.token_short_name.toLowerCase();
    }) : false;
    if (token) {
      return this.web3Service.getFullTokenInfo(token.address, false, 1).then((res: any) => {
        token.decimals = res.decimals;
        return token;
      })
    } else {
      return Promise.resolve(false);
    }
  }

  resolve(route: ActivatedRouteSnapshot) {
    const routeParams = route.params;
    return new Observable((observer) => {
      const params = {...route.queryParams};
      params.to = routeParams.token || params.to;
      const queryParams = {
        from: (
            params.from || (!!params.to ? 'ETH' : '')
        ).toLowerCase(),
        to: params.to ? params.to.toLowerCase() : false
      };

      const promises = [
        this.getTokenPromise(queryParams.from),
        this.getTokenPromise(queryParams.to),
      ];
      Promise.all(promises).then((res) => {
        observer.next(res);
        observer.complete();
      });
    });
  }
}

