import {AfterContentInit, Component, EventEmitter, Injectable, OnDestroy, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {MY_FORMATS} from '../contract-form/contract-form.component';
import {ContractsService} from '../services/contracts/contracts.service';
import {UserService} from '../services/user/user.service';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router} from '@angular/router';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDatepicker, MatDialog, MatDialogRef} from '@angular/material';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter} from '@angular/material-moment-adapter';

import BigNumber from 'bignumber.js';
import * as moment from 'moment';
import {HttpService} from '../services/http/http.service';
import {Web3Service} from '../services/web3/web3.service';
import {Observable} from 'rxjs';
import {UserInterface} from '../services/user/user.interface';


export interface IContractV3 {

  id?: number;
  name: string;

  base_address?: string;
  quote_address?: string;
  base_limit?: string;
  quote_limit?: string;
  stop_date?: number;
  owner_address?: string;
  public?: boolean|undefined;
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

  isEthereum?: boolean;
  notification?: boolean;
  notification_tg: string;
  notification_email: string;
}




@Component({
  selector: 'app-contract-form-all',
  templateUrl: './contract-form-all.component.html',
  styleUrls: ['../contract-form/contract-form.component.scss'],
  providers: [
    Location,
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class ContractFormAllComponent implements AfterContentInit, OnInit {

  @Output() BaseTokenChange = new EventEmitter<string>();
  @Output() QuoteTokenChange = new EventEmitter<string>();
  @Output() BaseTokenCustom = new EventEmitter<any>();
  @Output() QuoteTokenCustom = new EventEmitter<any>();


  @ViewChild('contactsReminderModal') contactsReminderModal: TemplateRef<any>;
  @ViewChild('rateNotification') rateNotification: TemplateRef<any>;

  public originalContract: IContractV3;

  public formIsSending: boolean;

  public currentUser;
  public editableContract = true;

  public minTime;
  public minDate: moment.Moment;

  public datePickerDate;
  public datePickerTime;

  public customTokens;
  public openedCustomTokens: {
    base: boolean;
    quote: boolean;
  };

  public revertedRate: boolean;
  public requestData: IContractV3;

  public cmcRate: {
    isLower?: boolean;
    direct: number;
    revert: number;
  };

  // For request form data
  protected formData: IContractV3;


  public openedForm: any;

  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
  @ViewChild('extraForm') public extraForm;

  @ViewChild('brokersForm') private brokersForm;
  @ViewChild('notificationForm') private notificationForm;

  public openedAdvanced: boolean;


  constructor(
    protected contractsService: ContractsService,
    private userService: UserService,
    private location: Location,
    private route: ActivatedRoute,
    protected router: Router,
    private dialog: MatDialog
  ) {

    this.originalContract = this.route.snapshot.data.contract;

    this.customTokens = {
      base: {},
      quote: {}
    };

    this.openedCustomTokens = {
      base: false,
      quote: false
    };

    this.currentUser = this.userService.getUserModel();
    this.userService.getCurrentUser().subscribe((userProfile: UserInterface) => {
      this.currentUser = userProfile;
    });

    this.minDate = moment().add(1, 'hour');
    const startDateTime = moment(this.minDate);
    this.datePickerDate = startDateTime.add(2, 'day');
    this.datePickerTime = `${startDateTime.hour()}:${startDateTime.minutes()}`;

  }



  ngOnInit() {
    if (this.originalContract) {
      this.requestData = {...this.originalContract as IContractV3};
      this.gotToForm(100);
    } else {
      this.requestData = {
        notification: true,
        tokens_info: {
          base: {
            token: {},
          },
          quote: {
            token: {},
          }
        }
      } as IContractV3;

      this.requestData.public = true;
      this.originalContract = {...this.requestData};
      this.gotToForm(0);
    }

  }


  public checkContactsReminder() {
    if (!this.requestData.notification) {
      this.dialog.open(this.contactsReminderModal, {
        width: '480px'
      });
    } else {
      this.gotToForm(100);
    }
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.dateChange();
    });

    if (this.route.snapshot.data.contract) {
      this.datePickerDate = moment(this.originalContract.stop_date);
      this.datePickerTime = `${this.datePickerDate.hour()}:${this.datePickerDate.minutes()}`;
    }
  }


  get baseBrokerFee() {
    if (!(this.requestData.tokens_info.base.amount && this.requestData.broker_fee_base)) {
      return 0;
    }
    return new BigNumber(this.requestData.tokens_info.base.amount).div(100).times(this.requestData.broker_fee_base).toString();
  }

  get quoteBrokerFee() {
    if (!(this.requestData.tokens_info.quote.amount && this.requestData.broker_fee_quote)) {
      return 0;
    }
    return new BigNumber(this.requestData.tokens_info.quote.amount).div(100).times(this.requestData.broker_fee_quote).toString();
  }

  get isEthereumSwap() {
    return this.requestData.tokens_info.quote.token.isEthereum &&
      this.requestData.tokens_info.base.token.isEthereum;
  }

  get tokens() {
    return this.requestData.tokens_info;
  }


  public revertCoins() {
    const baseCoin = {...this.requestData.tokens_info.base};
    this.requestData.tokens_info.base = {...this.requestData.tokens_info.quote};
    this.requestData.tokens_info.quote = {...baseCoin};

    this.BaseTokenCustom.emit(this.requestData.tokens_info.base);
    this.QuoteTokenCustom.emit(this.requestData.tokens_info.quote);
  }

  public getRate(revert?) {

    if (!(this.requestData.tokens_info.base.amount && this.requestData.tokens_info.quote.amount)) {
      return 0;
    }

    const baseCoinAmount = new BigNumber(this.requestData.tokens_info.base.amount);
    const quoteCoinAmount = new BigNumber(this.requestData.tokens_info.quote.amount);
    return (!revert ?
      baseCoinAmount.div(quoteCoinAmount).dp(4) :
      quoteCoinAmount.div(baseCoinAmount).dp(4)).toString();
  }

  private setFullDateTime() {
    const times = this.extraForm.value.time.split(':');
    this.extraForm.value.active_to.hour(times[0]);
    this.extraForm.value.active_to.minutes(times[1]);

    if (this.extraForm.value.active_to.isBefore(this.minDate)) {
      this.extraForm.controls.time.setErrors({incorrect: true});
    } else {
      this.extraForm.controls.time.setErrors(null);
    }
    setTimeout(() => {
      this.requestData.stop_date = this.extraForm.value.active_to.clone();
    });
  }

  public dateChange() {
    if (this.extraForm.value.active_to.isSame(this.minDate, 'day')) {
      this.minTime = `${this.minDate.hour()}:${this.minDate.minutes()}`;
    } else {
      this.minTime = null;
    }
    this.setFullDateTime();

  }

  public timeChange() {
    this.setFullDateTime();
  }


  public gotToForm(formNumber) {
    if (this.openedForm === formNumber) {
      return;
    }
    this.openedForm = formNumber;
    if (window.screen.width <= 580) {
      window.scrollTo(0, 0);
    }
  }

  public changedToken(coin) {

    const baseCoin = this.requestData.tokens_info.base.token;
    const quoteCoin = this.requestData.tokens_info.quote.token;

    if (baseCoin.cmc_id && quoteCoin.cmc_id && baseCoin.cmc_id > 0 && quoteCoin.cmc_id > 0) {
      this.contractsService.getCMCTokensRates(baseCoin.cmc_id, quoteCoin.cmc_id).then((result) => {
        this.cmcRate = {
          direct: new BigNumber(result.coin2).div(result.coin1).toNumber(),
          revert: new BigNumber(result.coin1).div(result.coin2).toNumber()
        };
      }, (err) => {
        this.cmcRate = undefined;
      });
    } else {
      this.cmcRate = undefined;
    }
  }

  public checkRates() {
    if (this.cmcRate) {
      const rateChanges = this.getRate().toNumber() - this.cmcRate.direct;
      if (Math.abs(rateChanges) > (this.cmcRate.direct / 100 * 20)) {
        this.cmcRate.isLower = rateChanges > 0;
        this.dialog.open(this.rateNotification, {
          width: '480px'
        });
      } else {
        this.gotToForm(1);
      }
    } else {
      this.gotToForm(1);
    }
  }

  private contractIsCreated(contract) {
    this.router.navigate(['/public-v3/' + contract.unique_link]);
  }

  private contractIsError(error) {
    console.log(error);
  }

  public setCustomToken(field, token) {
    token.isEthereum = true;
    this.customTokens[field] = token;
  }

  public addCustomToken(name) {
    this.requestData.tokens_info[name].token = {...this.customTokens[name]};
    this.requestData.tokens_info[name].token.custom = true;
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

  protected sendContractData(data) {
    if (this.formIsSending) {
      return;
    }
    this.formIsSending = true;

    if (window['dataLayer']) {
      window['dataLayer'].push({event: 'publish'});
    }

    this.contractsService[data.id ? 'updateSWAP3' : 'createSWAP3'](data)
      .then((result) => {
        this.contractIsCreated(result);
      }, (err) => {
        this.contractIsError(err);
      }).finally(() => {
      this.formIsSending = false;
    });
  }

  public createContract(tokenForm, advancedForm?: any) {

    this.formData = {
      ...tokenForm.value,
      ...advancedForm.value,
      ...this.notificationForm.value
    } as IContractV3;

    this.formData.comment = this.requestData.comment;


    if (this.requestData.tokens_info.quote.token.isEthereum && this.requestData.tokens_info.base.token.isEthereum) {
      this.formData.base_address = this.requestData.tokens_info.base.token.address;
      this.formData.quote_address = this.requestData.tokens_info.quote.token.address;
    }

    this.formData.public = !!this.extraForm.value.public;
    this.formData.stop_date = this.extraForm.value.active_to.clone().utc().format('YYYY-MM-DD HH:mm');

    this.formData.base_limit = this.requestData.tokens_info.base.amount;
    this.formData.quote_limit = this.requestData.tokens_info.quote.amount;

    this.formData.owner_address = this.extraForm.value.owner_address;

    this.formData.name = this.requestData.tokens_info.base.token.token_short_name +
      '<>' + this.requestData.tokens_info.quote.token.token_short_name;

    this.formData.min_quote_wei = this.formData.min_quote_wei || '0';
    this.formData.min_base_wei = this.formData.min_base_wei || '0';


    if (this.brokersForm) {
      this.formData = {
        ...this.formData,
        ...this.brokersForm.value
      };

      if (!this.formData.broker_fee) {
        this.formData.broker_fee_address = null;
        this.formData.broker_fee_base = null;
        this.formData.broker_fee_quote = null;
      }
    }

    this.formData.id = this.originalContract.id;

    if (this.currentUser.is_ghost) {
      this.userService.openAuthForm().then(() => {
        this.sendContractData(this.formData);
      });
    } else {
      this.sendContractData(this.formData);
    }

  }

}




@Injectable()
export class ContractEditV3Resolver implements Resolve<any> {
  private currentUser;
  private route;

  constructor(
    private contractsService: ContractsService,
    private userService: UserService,
    private httpService: HttpService,
    private web3Service: Web3Service,
    private router: Router
  ) {

  }

  private contractId: number;
  private publicLink: string;


  private getContractInformation(observer, isPublic?) {

    const promise = (!isPublic ?
      this.contractsService.getContractV3Information(this.contractId) :
      this.contractsService.getSwapByPublic(this.publicLink)) as Promise<any>;

    promise.then((trade: IContractV3) => {
      this.web3Service.getSWAPSCoinInfo(trade).then((result: any) => {
        result.isEthereum = result.tokens_info.base.token.isEthereum && result.tokens_info.quote.token.isEthereum;
        observer.next(result);
        observer.complete();
      });
    }, () => {
      this.router.navigate(['/trades']);
    });

  }

  resolve(route: ActivatedRouteSnapshot) {
    this.route = route;
    if (route.params.id) {
      this.contractId = route.params.id;
      return new Observable((observer) => {
        const subscription = this.userService.getCurrentUser(false, true).subscribe((user) => {
          this.currentUser = user;
          if (!user.is_ghost) {
            this.getContractInformation(observer);
          } else {
            this.userService.openAuthForm().then(() => {
              this.getContractInformation(observer);
            }, () => {
              this.router.navigate(['/trades']);
              //
            });
          }
          subscription.unsubscribe();
        });
        return {
          unsubscribe() {}
        };
      });
    } else if (route.params.public_link) {
      this.publicLink = route.params.public_link;
      return new Observable((observer) => {
        this.getContractInformation(observer, true);
      });
    }
  }
}
