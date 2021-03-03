import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  AfterContentInit,
  TemplateRef,
  ViewChild,
  Output,
  Injectable,
  ElementRef
} from '@angular/core';
import BigNumber from 'bignumber.js';
import { Router, ActivatedRoute, Resolve, ActivatedRouteSnapshot } from '@angular/router';
import * as moment from 'moment';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatDialog,
  MatDialogRef
} from '@angular/material';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter
} from '@angular/material-moment-adapter';
import { Observable } from 'rxjs';
import { SWAPS_V2 } from '../../contracts-preview-v3/contracts-preview-v3.component';
import { Web3Service } from '../../services/web3/web3.service';
import { UserService } from '../../services/user/user.service';
import { CHAIN_OF_NETWORK, ERC20_TOKEN_ABI } from '../../services/web3/web3.constants';
import { ContractsService } from '../../services/contracts/contracts.service';

import { OneInchService } from '../../models/1inch/1inch';
import { BackendApiService } from '../../services/backend-api/backend-api.service';
import { UniSwapService } from '../../services/instant-trade/uni-swap-service/uni-swap.service';
import { InstantTrade, InstantTradeToken } from '../../services/instant-trade/types';
import { coingeckoTestTokens } from '../../../test/tokens/coingecko-tokens';
import { RubicError } from '../../errors/RubicError';
import { Web3ApiService } from '../../services/web3Api/web3-api.service';
import { CoingeckoApiService } from '../../services/coingecko-api/coingecko-api.service';

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
    uniswap: {
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

// eslint-disable-next-line @typescript-eslint/naming-convention
enum UNISWAP_TRADE_STATUS {
  PARAMS_CALCULATION = 'PARAMS_CALCULATION',
  APPROVE_IN_PROGRESS = 'APPROVE_IN_PROGRESS',
  TRADE_IN_PROGRESS = 'TRADE_IN_PROGRESS'
}

export const MY_FORMATS = {
  useUtc: true,
  parse: {
    dateInput: 'LL'
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'X',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

interface IOrderBookTokens {
  ethereum: any[];
  'binance-smart-chain': any[];
  matic: any[];
}

@Component({
  selector: 'app-start-form',
  templateUrl: './start-form.component.html',
  styleUrls: ['./start-form.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class StartFormComponent implements OnInit, OnDestroy, AfterContentInit {
  @ViewChild('metaMaskError', { static: true }) metaMaskError: TemplateRef<any>;

  @ViewChild('insufficientFundsError', { static: true }) insufficientFundsError: TemplateRef<any>;

  @ViewChild('container', { static: true }) container: ElementRef;

  @Output() BaseTokenCustom = new EventEmitter<any>();

  @Output() QuoteTokenCustom = new EventEmitter<any>();

  @Output() changedSocialState = new EventEmitter<string>();

  @Output() instanceTradesSelect = new EventEmitter<any>();

  @Output() blockchainTradesSelect = new EventEmitter<any>();

  public currentUser;

  public coingeckoRate: {
    change?: number;
    isLower?: boolean;
    direct: number;
    revert: number;
  };

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

  public orderBookTokens: IOrderBookTokens;

  public serviceAvailable: boolean = !!(
    window['coingecko_tokens'] && window['coingecko_tokens'].length
  );

  public instantTradeInProgress: boolean = false;

  public uniSwapTrade: InstantTrade;

  public UNISWAP_TRADE_STATUS = UNISWAP_TRADE_STATUS;

  public uniSwapTradeStatus: UNISWAP_TRADE_STATUS = undefined;

  private web3Contract;

  private contractAddress: string;

  private platforms = ['ethereum', 'binance-smart-chain', 'matic'];

  public isTestMode = false;

  public successModel = {
    open: false,
    transactionHash: ''
  };

  public bestRate: string;

  public oneInchGasInfo = null;

  public instantTradeError: RubicError;

  // private socialFormData: {
  //   network: string;
  //   data: any;
  // };

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

  @ViewChild('startForm', { static: true }) public startForm;

  @ViewChild('advSettings', { static: true }) public advSettings;

  public getInstanceQuoteProgress = false;

  public getInstanceQuoteTimeout: any;

  private tokensCache = {
    quote: '',
    base: '',
    baseAmount: ''
  };

  private onInit = false;

  public resetFormEmitter = new EventEmitter();

  public selectedNetwork;

  private metamaskAccount: string;

  constructor(
    private dialog: MatDialog,
    protected contractsService: ContractsService,
    private web3Service: Web3Service,
    protected router: Router,
    private userService: UserService,
    private route: ActivatedRoute,
    private oneInchService: OneInchService,
    private backendApiService: BackendApiService,
    private uniSwapService: UniSwapService,
    private web3ApiService: Web3ApiService,
    private coinGeckoApiService: CoingeckoApiService
  ) {
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
        customToken: false
      },
      quote: {
        token: {},
        customToken: false
      }
    };
    this.isAdvSettingsOpen = false;
    this.openedCustomTokens = {
      base: false,
      quote: false
    };

    this.customTokens = {
      base: {},
      quote: {}
    };

    this.minDate = moment().add(1, 'hour');
    const startDateTime = moment(this.minDate);

    this.datePickerDate = startDateTime.add(1, 'week');
    this.datePickerTime = `${startDateTime.hour()}:${startDateTime.minutes()}`;
    this.isCreatingContract = false;

    this.instanceTradesTokens = this.oneInchService.getAutocompleteTokensList();
    this.getOrderBookTokens();

    // @ts-ignore
    window.useTestMode = () => {
      // @ts-ignore
      window.coingecko_tokens = coingeckoTestTokens;
      this.instanceTradesTokens = coingeckoTestTokens;
      this.isTestMode = true;
    };
  }

  private async setBestRate() {
    if (
      this.uniSwapTradeStatus === UNISWAP_TRADE_STATUS.PARAMS_CALCULATION ||
      this.getInstanceQuoteProgress
    ) {
      return;
    }

    if (!this.uniSwapTrade) {
      this.bestRate = 'oneInch';
      return;
    }

    if (!this.requestData.tokens_info.quote || !this.requestData.tokens_info.quote.amount) {
      this.bestRate = 'uniSwap';
      return;
    }

    const tokenUsdPrice = this.requestData.tokens_info.quote.token.usd_price;

    const oneInchUsdAmount = new BigNumber(this.requestData.tokens_info.quote.amount).multipliedBy(
      tokenUsdPrice
    );
    const uniSwapUsdAmount = this.uniSwapTrade.to.amount.multipliedBy(tokenUsdPrice);

    const oneInchGasUsdCost = this.oneInchGasInfo.gasFeeInUsd;
    const uniSwapGasUsdCost = this.uniSwapTrade.gasFeeInUsd;

    const oneInchProfit = oneInchUsdAmount.minus(oneInchGasUsdCost);
    const uniSwapProfit = uniSwapUsdAmount.minus(uniSwapGasUsdCost);
    if (oneInchProfit.gt(uniSwapProfit)) {
      this.bestRate = 'oneInch';
      return;
    }
    this.bestRate = 'uniSwap';
  }

  public isChangedToken() {
    localStorage.setItem('form_new_values', JSON.stringify({ tokens_info: this.tokensData }));
  }

  public getRate(revert?): string {
    if (!(this.requestData.tokens_info.base.amount && this.requestData.tokens_info.quote.amount)) {
      return '0';
    }

    const baseCoinAmount = new BigNumber(this.requestData.tokens_info.base.amount);
    const quoteCoinAmount = new BigNumber(this.requestData.tokens_info.quote.amount);
    return (!revert
      ? baseCoinAmount.div(quoteCoinAmount)
      : quoteCoinAmount.div(baseCoinAmount)
    ).toString();
  }

  private getOrderBookTokens() {
    this.orderBookTokens = {} as IOrderBookTokens;
    // eslint-disable-next-line no-restricted-syntax
    for (const platform of this.platforms) {
      this.orderBookTokens[platform] = window['coingecko_tokens'].filter(
        token => token.platform === platform
      );
    }
  }

  public networkToPlatform(network: number) {
    const blockchain = this.blockchainsOfNetworks[network];
    if (blockchain === 'binance') {
      return 'binance-smart-chain';
    }
    return blockchain;
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

  public checkInstancePrice() {
    const params = this.getOrderParams();
    if (!(+params.amount > 0)) {
      return;
    }
    const quoteDecimalsTimes = this.requestData.tokens_info.quote.token.decimals ** 10;
    this.getInstanceQuoteProgress = true;
    if (this.getInstanceQuoteTimeout) {
      clearTimeout(this.getInstanceQuoteTimeout);
    }

    this.getInstanceQuoteTimeout = setTimeout(() => {
      this.oneInchService.getQuote(params).then((result: any) => {
        this.instanceTradeParams = result;
        this.requestData.tokens_info.quote.amount = Number(result.toTokenAmount)
          ? new BigNumber(result.toTokenAmount).div(quoteDecimalsTimes).toString(10)
          : '';
        // this.QuoteTokenCustom.emit();
        this.getInstanceQuoteProgress = false;
        this.setOneInchGasInfo(result.estimatedGas).then(() => this.setBestRate());
      });
    }, 1000);
  }

  private async setOneInchGasInfo(gasLimit) {
    const etherPrice = await this.coinGeckoApiService.getEtherPriceInUsd();
    const gasFeeInUsd = await this.web3ApiService.getGasFee(new BigNumber(gasLimit), etherPrice);
    const gasFeeInEth = await this.web3ApiService.getGasFee(
      new BigNumber(gasLimit),
      new BigNumber(1)
    );

    this.oneInchGasInfo = {
      gasFeeInUsd,
      gasFeeInEth
    };
  }

  private checkAndGetInstanceQuote(force?: boolean) {
    const baseCoin = this.requestData.tokens_info.base.token;
    const quoteCoin = this.requestData.tokens_info.quote.token;

    const identical =
      this.tokensCache.base === baseCoin.address && this.tokensCache.quote === quoteCoin.address;
    if (identical) {
      this.requestData.tokens_info.quote.amount = '';
    }
    if (!identical || force) {
      this.tokensCache.base = baseCoin.address;
      this.tokensCache.quote = quoteCoin.address;
      if (
        baseCoin.address &&
        quoteCoin.address &&
        baseCoin.address !== quoteCoin.address &&
        this.requestData.network === 1
      ) {
        this.instantTradesAvailable = this.oneInchService.checkTokensPair(baseCoin, quoteCoin);
      }
    }

    if (
      !identical ||
      force ||
      this.tokensCache.baseAmount !== this.requestData.tokens_info.base.amount
    ) {
      this.checkInstancePrice();
      this.tokensCache.baseAmount = this.requestData.tokens_info.base.amount;
    } else {
      const quoteDecimalsTimes = this.requestData.tokens_info.quote.token.decimals ** 10;
      this.requestData.tokens_info.quote.amount = new BigNumber(
        this.instanceTradeParams.toTokenAmount
      )
        .div(quoteDecimalsTimes)
        .toString(10);
      // this.QuoteTokenCustom.emit();
    }
  }

  public async recalculateUniSwapParameters() {
    if (
      this.requestData.tokens_info.base.token.address &&
      this.requestData.tokens_info.base.amount &&
      this.requestData.tokens_info.quote.token.address
    ) {
      if (
        Number(this.web3Service.ethereum.networkVersion) !== 1 &&
        !this.isTestMode &&
        !this.metaMaskErrorModal
      ) {
        this.metaMaskErrorModal = this.dialog.open(this.metaMaskError, {
          width: '480px',
          panelClass: 'custom-dialog-container'
        });
        return;
      }

      if (
        this.uniSwapTrade &&
        this.uniSwapTrade.from.token.address === this.requestData.tokens_info.base.token.address &&
        this.uniSwapTrade.to.token.address === this.requestData.tokens_info.quote.token.address &&
        this.uniSwapTrade.from.amount.toString() === this.requestData.tokens_info.base.amount
      ) {
        return;
      }

      this.uniSwapTrade = undefined;
      this.uniSwapTradeStatus = UNISWAP_TRADE_STATUS.PARAMS_CALCULATION;
      const fromToken: InstantTradeToken = {
        network: 'ETH',
        address: this.requestData.tokens_info.base.token.address,
        decimals: this.requestData.tokens_info.base.token.decimals,
        symbol: this.requestData.tokens_info.base.token.token_short_title
      };

      const toToken: InstantTradeToken = {
        network: 'ETH',
        address: this.requestData.tokens_info.quote.token.address,
        decimals: this.requestData.tokens_info.quote.token.decimals,
        symbol: this.requestData.tokens_info.quote.token.token_short_title
      };

      this.uniSwapTrade = await this.uniSwapService.calculateTrade(
        new BigNumber(this.requestData.tokens_info.base.amount),
        fromToken,
        toToken
      );
      if (this.uniSwapTrade) {
        this.requestData.tokens_info.uniswap.amount = this.uniSwapTrade.to.amount.toString();
      } else {
        this.requestData.tokens_info.uniswap.amount = '';
      }
      this.uniSwapTradeStatus = null;
      this.setBestRate();
    } else {
      this.uniSwapTrade = undefined;
      this.requestData.tokens_info.uniswap.amount = '';
    }
  }

  public changeUniSwapToken() {
    this.requestData.tokens_info.quote.token = this.requestData.tokens_info.uniswap.token;
    this.changedToken();
  }

  public changedToken(force?: boolean) {
    this.bestRate = undefined;
    this.requestData.tokens_info.uniswap.token = this.requestData.tokens_info.quote.token;
    this.recalculateUniSwapParameters();
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
      new BigNumber(this.requestData.tokens_info.base.amount).gt(0) &&
      new BigNumber(this.requestData.tokens_info.quote.amount).gt(0) &&
      baseCoin.usd_price &&
      quoteCoin.usd_price
    ) {
      this.coingeckoRate = {
        revert: new BigNumber(baseCoin.usd_price).div(quoteCoin.usd_price).toNumber(),
        direct: new BigNumber(quoteCoin.usd_price).div(baseCoin.usd_price).toNumber()
      };
      const rate = parseFloat(this.getRate(true));
      const rateChanges = parseFloat(this.getRate()) - this.coingeckoRate.direct;
      this.coingeckoRate.isLower = rateChanges > 0;
      this.coingeckoRate.change = parseFloat(
        (Math.abs(-(rate / this.coingeckoRate.revert - 1)) * 100).toFixed(2)
      );
    } else {
      this.coingeckoRate = undefined;
    }
  }

  public toogleAdvSettings() {
    this.isAdvSettingsOpen = !this.isAdvSettingsOpen;
  }

  ngOnInit() {
    this.setNetwork(1);
    this.onInit = true;
    this.checkQueryParams();
  }

  private resetStartForm(network?) {
    const targetToken = {};
    this.requestData = {
      tokens_info: {
        base: {
          token: {}
        },
        quote: {
          token: {}
        },
        uniswap: {
          token: targetToken
        }
      },
      network: network || defaultNetwork,
      public: true,
      permanent: false,
      broker_fee_base: 0.1,
      broker_fee_quote: 0.1
    };
    this.customTokens = {
      base: {},
      quote: {}
    };

    if (this.onInit) {
      this.BaseTokenCustom.emit(false);
      this.QuoteTokenCustom.emit(false);
      this.startForm.resetForm();
      this.startForm.form.reset();
      this.resetFormEmitter.emit();
    }
  }

  public setNetwork(network) {
    this.resetStartForm(network);
    this.selectedNetwork = network;
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
    /* if (!isBase) {
      this.requestData.tokens_info.base = {
        token: {},
      };
    }
    if (!isQuote) {
      this.requestData.tokens_info.quote = {
        token: {},
      };
    } */
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

    const coingeckoBaseToken = window['coingecko_tokens'].find(t => {
      return (
        t.token_short_title === baseCoin.token_short_title &&
        t.address.toLowerCase() === baseCoin.address.toLowerCase()
      );
    });
    const coingeckoQuoteToken = window['coingecko_tokens'].find(t => {
      return (
        t.token_short_title === quoteCoin.token_short_title &&
        t.address.toLowerCase() === quoteCoin.address.toLowerCase()
      );
    });

    if (!coingeckoBaseToken) {
      this.requestData.tokens_info.base = {
        token: {}
      };
    }
    if (!coingeckoQuoteToken) {
      this.requestData.tokens_info.quote = {
        token: {}
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

  // Do nothing.
  public changePD() {
    //   if (
    //     this.requestData.tokens_info.base.token.token_title &&
    //     this.requestData.tokens_info.quote.token.token_title
    //   ) {
    //     this.requestData.public = this.requestData.public;
    //     console.log('requestData.public', this.requestData.public);
    //   }
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
    if (!(this.requestData.tokens_info.base.amount && this.requestData.broker_fee_base)) {
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
      default:
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

    this.sendData.name = `${this.requestData.tokens_info.base.token.token_short_title} <> ${this.requestData.tokens_info.quote.token.token_short_title}`;

    this.sendData.base_address = this.requestData.tokens_info.base.token.address;
    this.sendData.quote_address = this.requestData.tokens_info.quote.token.address;

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

    this.contractAddress = SWAPS_V2.ADDRESSES[CHAIN_OF_NETWORK[this.sendData.network]];
    this.web3Contract = this.web3Service.getContract(
      SWAPS_V2.ABI,
      this.contractAddress,
      this.sendData.network
    );
    this.sendData.contract_address = this.contractAddress;

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
    params.fromTokenAddress = baseCoin.address;
    params.toTokenAddress = quoteCoin.address;
    const baseDecimalsTimes = this.requestData.tokens_info.base.token.decimals ** 10;
    params.amount = new BigNumber(this.requestData.tokens_info.base.amount)
      .times(baseDecimalsTimes)
      .toString(10);
    return params;
  }

  public createUniSwapTrade() {
    this.uniSwapTradeStatus = UNISWAP_TRADE_STATUS.TRADE_IN_PROGRESS;
    if (this.uniSwapTrade) {
      this.uniSwapService
        .createTrade(this.uniSwapTrade, {
          onApprove: () => {
            this.instantTradeInProgress = true;
            this.uniSwapTradeStatus = UNISWAP_TRADE_STATUS.APPROVE_IN_PROGRESS;
          },
          onConfirm: () => {
            this.instantTradeInProgress = true;
            this.uniSwapTradeStatus = UNISWAP_TRADE_STATUS.TRADE_IN_PROGRESS;
          }
        })
        .finally(() => {
          this.instantTradeInProgress = false;
          this.uniSwapTradeStatus = undefined;
        })
        .then(receipt => {
          this.successModel.open = true;
          this.successModel.transactionHash = receipt.transactionHash;

          this.backendApiService.notifyInstantTradesBot({
            provider: 'UniSwap',
            walletAddress: receipt.from,
            amountFrom: Number(this.uniSwapTrade.from.amount.toFixed(10)),
            amountTo: Number(this.uniSwapTrade.to.amount.toFixed(10)),
            symbolFrom: this.uniSwapTrade.from.token.symbol,
            symbolTo: this.uniSwapTrade.to.token.symbol,
            txHash: receipt.transactionHash
          });
        })
        .catch(err => {
          if (err instanceof RubicError) {
            this.instantTradeError = err;
          } else {
            console.error(err);
          }
        });
    }
  }

  private async createInstanceTrade() {
    const params = this.getOrderParams();
    params.fromAddress = this.metamaskAccount;
    this.getInstanceQuoteProgress = true;

    const remoteContractAddress = ((await this.oneInchService.getApproveSpender()) as any).address;
    const baseToken = this.requestData.tokens_info.base.token;
    if (baseToken.token_short_title !== 'ETH') {
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
    this.oneInchService
      .getSwap(params, this.instanceTradeParams)
      .then((result: any) => {
        const gasIncreasedTx = { ...result.tx, gas: Math.round(Number(result.tx.gas) * 1.25) };

        const afterConfirm = (hash: string) => {
          this.instantTradeInProgress = true;

          const amountFrom =
            Number(result.fromTokenAmount) / 10 ** Number(result.fromToken.decimals);
          const amountTo = Number(result.toTokenAmount) / 10 ** Number(result.toToken.decimals);
          this.backendApiService.notifyInstantTradesBot({
            provider: 'OneInch',
            walletAddress: result.tx.from,
            amountFrom,
            amountTo,
            symbolFrom: result.fromToken.symbol,
            symbolTo: result.toToken.symbol,
            txHash: hash
          });
        };

        this.web3Service
          .sendTransaction(gasIncreasedTx, this.requestData.network, afterConfirm)
          .then(
            () => {
              this.resetStartForm();
              // const win = window.open(
              //   `https://etherscan.io/tx/${res.transactionHash}`,
              //   'target=_blank'
              // );
            },
            () => {}
          )
          .finally(() => {
            this.getInstanceQuoteProgress = false;
            this.instantTradeInProgress = false;
          });
      })
      .catch(e => {
        console.log(e);
        this.metaMaskErrorModal = this.dialog.open(this.insufficientFundsError, {
          width: '480px',
          panelClass: 'custom-dialog-container'
        });
        this.getInstanceQuoteProgress = false;
        this.instantTradeInProgress = false;
      });
  }

  private async check1InchAllowance(remoteContractAddress, params) {
    const baseToken = this.requestData.tokens_info.base.token;
    const tokenContract = this.web3Service.getContract(
      ERC20_TOKEN_ABI,
      baseToken.address,
      this.requestData.network
    );
    const sendApproveTx = () => {
      const approveMethod = this.web3Service.getMethodInterface('approve');
      const approveSignature = this.web3Service.encodeFunctionCall(approveMethod, [
        remoteContractAddress,
        params.amount.toString(10)
      ]);

      return this.web3Service.sendTransaction(
        {
          from: this.metamaskAccount,
          to: baseToken.address,
          data: approveSignature
        },
        this.requestData.network,
        () => {
          this.instantTradeInProgress = true;
        }
      );
    };
    return (
      tokenContract.methods
        .allowance(this.metamaskAccount, remoteContractAddress)
        .call()
        // eslint-disable-next-line consistent-return
        .then(result => {
          result = new BigNumber(result);
          const noAllowance = result.minus(params.amount).isNegative();
          if (noAllowance) {
            return sendApproveTx();
          }
        })
    );
  }

  public createContract() {
    const accSubscriber = this.updateAddresses(true).subscribe(
      res => {
        // eslint-disable-next-line prefer-destructuring
        this.metamaskAccount = res['metamask'][0];

        if (this.instanceTrade && this.instantTradesAvailable) {
          this.createInstanceTrade();
        } else if (!this.instanceTrade) {
          this.buildAndCreate();
        }
      },
      () => {
        this.metaMaskErrorModal = this.dialog.open(this.metaMaskError, {
          width: '480px',
          panelClass: 'custom-dialog-container'
        });
      },
      () => {
        accSubscriber.unsubscribe();
      }
    );
  }

  private sendMetaMaskRequest(data) {
    // this.socialFormData = {
    //   network: 'mm',
    //   data
    // };
    this.userService.metaMaskAuth(data).then(
      () => {
        this.sendContractData(this.sendData);
      },
      error => {
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
          default:
            break;
        }
        break;
      default:
        break;
    }
  }

  public MetamaskAuth() {
    if (window['ethereum'] && window['ethereum'].isMetaMask) {
      window['ethereum'].enable().then(accounts => {
        const address = accounts[0];
        this.userService.getMetaMaskAuthMsg().then(msg => {
          this.web3Service.getSignedMetaMaskMsg(msg, address).then(signed => {
            this.sendMetaMaskRequest({
              address,
              msg,
              signed_msg: signed
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
        result => {
          if (!data.id) {
            this.initialisationTrade(result);
          } else {
            this.contractIsCreated(result);
          }
        },
        err => {
          console.log(err);
        }
      )
      .finally(() => {
        this.formIsSending = false;
      });
  }

  private contractIsCreated(contract) {
    this.router.navigate([`/public-v3/${contract.unique_link}`]);
  }

  public initialisationTrade(originalContract) {
    const details = originalContract;
    const interfaceMethod = this.web3Service.getMethodInterface('createOrder', SWAPS_V2.ABI);

    const baseDecimalsTimes = this.requestData.tokens_info.base.token.decimals ** 10;
    const quoteDecimalsTimes = this.requestData.tokens_info.quote.token.decimals ** 10;

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
      details.broker_fee
        ? details.broker_fee_address
        : '0x0000000000000000000000000000000000000000',
      details.broker_fee ? new BigNumber(details.broker_fee_base).times(100).toString(10) : '0',
      details.broker_fee ? new BigNumber(details.broker_fee_quote).times(100).toString(10) : '0'
    ];

    const activateSignature = this.web3Service.encodeFunctionCall(interfaceMethod, trxRequest);
    const sendActivateTrx = async (wallet?) => {
      try {
        const fee = await this.web3Contract.methods.feeAmount().call();
        await this.web3Service.sendTransaction(
          {
            from: wallet,
            to: this.contractAddress,
            data: activateSignature,
            value: fee
          },
          this.sendData.network
        );
        this.sendData.id = details.id;
        this.sendData.rubic_initialized = true;
        this.sendContractData(this.sendData);
      } catch (err) {
        console.log(err);
        this.isCreatingContract = false;
      }
    };
    return sendActivateTrx();
  }

  public closeMetaMaskError() {
    this.metaMaskErrorModal.close();
  }

  private updateAddresses(ifEnabled?) {
    return this.web3Service.getAccounts(false, ifEnabled, this.requestData.network);
  }

  public revertCoins(): void {
    const baseToken = this.requestData.tokens_info.base;
    this.requestData.tokens_info.base = this.requestData.tokens_info.quote;
    this.requestData.tokens_info.quote = baseToken;
    this.BaseTokenCustom.emit(this.requestData.tokens_info[name]);
    this.QuoteTokenCustom.emit(this.requestData.tokens_info[name]);
  }
}

@Injectable()
export class StartFormResolver implements Resolve<any> {
  private ethTokens: any[] = window['coingecko_tokens'].filter(t => {
    return t.platform === 'ethereum';
  });

  constructor(private web3Service: Web3Service) {}

  private getTokenPromise(token_symbol) {
    const token = token_symbol
      ? this.ethTokens.find(exToken => {
          return token_symbol.toUpperCase() === exToken.token_short_title;
        })
      : false;
    if (token) {
      return this.web3Service.getFullTokenInfo(token.address, 1).then((res: any) => {
        token.decimals = res.decimals;
        return token;
      });
    }
    return Promise.resolve(false);
  }

  resolve(route: ActivatedRouteSnapshot) {
    const routeParams = route.params;
    return new Observable(observer => {
      const params = { ...route.queryParams };
      params.to = routeParams.token || params.to;
      const queryParams = {
        from: (params.from || (params.to ? 'ETH' : '')).toLowerCase(),
        to: params.to ? params.to.toLowerCase() : false
      };

      const promises = [
        this.getTokenPromise(queryParams.from),
        this.getTokenPromise(queryParams.to)
      ];
      Promise.all(promises).then(res => {
        observer.next(res);
        observer.complete();
      });
    });
  }
}
