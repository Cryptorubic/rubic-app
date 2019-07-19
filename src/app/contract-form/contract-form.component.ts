import {AfterContentInit, Component, EventEmitter, Injectable, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDatepicker} from '@angular/material';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {ContractsService} from '../services/contracts/contracts.service';
import {ActivatedRoute, ActivatedRouteSnapshot, Resolve, Router} from '@angular/router';
import {UserService} from '../services/user/user.service';
import {Observable} from 'rxjs';

import * as moment from 'moment';
import {UserInterface} from '../services/user/user.interface';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {TokenInfoInterface, Web3Service} from '../services/web3/web3.service';
import {HttpService} from '../services/http/http.service';


import BigNumber from 'bignumber.js';

export interface IContractDetails {
  base_address?: string;
  quote_address?: string;
  base_limit?: string;
  quote_limit?: string;
  stop_date?: number;
  owner_address?: string;
  public?: boolean|undefined;
  unique_link?: string;
  unique_link_url?: string;
  eth_contract?: any;

  broker_fee: boolean;
  broker_fee_address: string;
  broker_fee_base: number;
  broker_fee_quote: number;

  tokens_info?: {
    base: {
      token: any;
      amount: string;
    };
    quote: {
      token: any;
      amount: string;
    };
  };


  whitelist?: any;
  whitelist_address?: any;
  min_base_wei?: any;
  memo_contract?: any;
  min_quote_wei?: any;
}


export interface IContract {
  isSwapped?: boolean;
  contract_details?: IContractDetails;
  id?: number|undefined;
  contract_type?: number;
  network?: 1;
  state?: string;
  cost?: any;
  name?: string;
  isAuthor?: boolean;
  user?: number;
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
  selector: 'app-contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss'],
  providers: [
    Location,
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class ContractFormComponent implements AfterContentInit, OnInit, OnDestroy {

  @Output() BaseTokenChange = new EventEmitter<string>();
  @Output() QuoteTokenChange = new EventEmitter<string>();
  @Output() BaseTokenCustom = new EventEmitter<any>();
  @Output() QuoteTokenCustom = new EventEmitter<any>();

  constructor(
    protected contractsService: ContractsService,
    private userService: UserService,
    private location: Location,
    private route: ActivatedRoute,
    protected router: Router
  ) {

    this.formData = {
      contract_type: 20,
      network: 1
    };


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
    this.datePickerDate = startDateTime.add(1, 'hour');
    this.datePickerTime = `${startDateTime.hour()}:${startDateTime.minutes()}`;

  }

  get tokens() {
    return this.originalContract.contract_details.tokens_info;
  }
  public confirmationIsProgress: boolean;
  public formIsSending: boolean;

  public currentUser;
  public editableContract = true;

  public minTime;
  public minDate: moment.Moment;

  public datePickerDate;
  public datePickerTime;

  private updateContractTimer;

  public customTokens;
  public openedCustomTokens: {
    base: boolean;
    quote: boolean;
  };

  public revertedRate: boolean;

  // For preview
  public originalContract: IContract;

  // For form displaying
  public requestData: IContractDetails;

  // For request form data
  protected formData: IContract;


  public openedForm: any;

  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
  @ViewChild('extraForm') public extraForm;

  @ViewChild('brokersForm') private brokersForm;


  protected onDestroyPage;


  protected setContractType(typeNumber) {
    this.formData.contract_type = typeNumber;
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

  protected analyzeContractState(contract) {

    const tokensInfo = this.originalContract.contract_details.tokens_info;
    this.originalContract = contract;
    this.originalContract.contract_details.tokens_info = tokensInfo;

    switch (contract.state) {
      case 'CREATED':
        this.gotToForm(100);
        break;
      case 'WAITING_FOR_PAYMENT':
        this.editableContract = false;
        this.gotToForm(101);
        this.checkContractState();
        break;
      case 'WAITING_FOR_DEPLOYMENT':
        this.editableContract = false;
        this.gotToForm(102);
        this.checkContractState();
        break;
      case 'ACTIVE':
        this.router.navigate(['/contract/' + contract.id]);
        break;
      case 'POSTPONED':
        this.router.navigate(['/contract/' + contract.id]);
        break;
    }
  }

  protected checkContractState() {
    this.updateContractTimer = setTimeout(() => {
      this.contractsService.getContract(this.originalContract.id).then((contract) => {
        this.analyzeContractState(contract);
      }, () => {
        this.updateContractTimer = setTimeout(() => {
          this.checkContractState();
        }, 5000);
      });
    }, 5000);
  }


  ngOnInit() {
    const draftData = localStorage.getItem('form_new_values');
    if (this.originalContract) {
      this.requestData = {...this.originalContract.contract_details};
      this.analyzeContractState(this.originalContract);
    } else {
      this.requestData = draftData ? JSON.parse(draftData) : {
        tokens_info: {
          base: {
            token: {},
          },
          quote: {
            token: {},
          }
        }
      };

      this.requestData.public = true;
      this.originalContract = {
        contract_details: {...this.requestData}
      };
      this.gotToForm(0);
    }

  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.dateChange();
    });

    if (this.route.snapshot.data.contract) {
      this.formData.id = this.originalContract.id;
      this.datePickerDate = moment(this.originalContract.contract_details.stop_date);
      this.datePickerTime = `${this.datePickerDate.hour()}:${this.datePickerDate.minutes()}`;
    }
  }


  public revertCoins() {
    const baseCoin = {...this.requestData.tokens_info.base};
    this.requestData.tokens_info.base = {...this.requestData.tokens_info.quote};
    this.requestData.tokens_info.quote = {...baseCoin};

    this.BaseTokenCustom.emit(this.requestData.tokens_info.base);
    this.QuoteTokenCustom.emit(this.requestData.tokens_info.quote);
  }


  public addCustomToken(name) {
    this.requestData.tokens_info[name].token = {...this.customTokens[name]};
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

  public setCustomToken(field, token) {
    this.customTokens[field] = token;
  }

  private contractIsCreated(contract) {
    let newState;
    switch (contract.contract_type) {
      case 21:
        newState = `/view-v2/${contract.id}`;
        break;
      case 20:
        newState = `/view/${contract.id}`;
        break;

    }

    this.location.replaceState(newState);
    this.formData.id = contract.id;
    this.originalContract = contract;
    this.originalContract.contract_details.tokens_info = this.requestData.tokens_info;
    this.gotToForm(100);
  }

  private contractIsError(error) {
  }

  protected sendContractData(data) {
    if (this.formIsSending) {
      return;
    }
    this.formIsSending = true;
    this.contractsService[data.id ? 'updateContract' : 'createContract'](this.formData)
      .then((result) => {
        this.contractIsCreated(result);
      }, (err) => {
        this.contractIsError(err);
      }).finally(() => {
      this.formIsSending = false;
    });
  }

  public createContract(tokenForm, advancedForm?: any) {
    this.formData.contract_details = {...tokenForm.value} as IContractDetails;
    this.formData.contract_details.public = !!this.extraForm.value.public;
    this.formData.contract_details.stop_date = this.extraForm.value.active_to.utc().format('YYYY-MM-DD HH:mm');
    this.formData.contract_details.base_limit = this.requestData.tokens_info.base.amount;
    this.formData.contract_details.quote_limit = this.requestData.tokens_info.quote.amount;

    this.formData.contract_details.owner_address = this.extraForm.value.owner_address;
    this.formData.name = this.requestData.tokens_info.base.token.token_short_name +
      '<>' + this.requestData.tokens_info.quote.token.token_short_name;

    if (advancedForm) {
      this.formData.contract_details = {
        ...this.formData.contract_details,
        ...advancedForm.value
      };

      this.formData.contract_details.min_quote_wei = this.formData.contract_details.min_quote_wei || '0';
      this.formData.contract_details.min_base_wei = this.formData.contract_details.min_base_wei || '0';

    }


    if (this.brokersForm) {
      this.formData.contract_details = {
        ...this.formData.contract_details,
        ...this.brokersForm.value
      };
      if (!this.formData.contract_details.broker_fee) {
        this.formData.contract_details.broker_fee_address = null;
        this.formData.contract_details.broker_fee_base = null;
        this.formData.contract_details.broker_fee_quote = null;
      }
    }

    if (this.currentUser.is_ghost) {
      this.userService.openAuthForm().then(() => {
        this.sendContractData(this.formData);
      });
    } else {
      this.sendContractData(this.formData);
    }

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

    this.requestData.stop_date = this.extraForm.value.active_to;
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


  public confirmContract() {
    if (this.confirmationIsProgress) {
      return;
    }
    this.confirmationIsProgress = true;
    this.contractsService.startWatchContract(this.formData.id).then((contract) => {
      this.analyzeContractState(contract);
    }, (err) => {

    }).finally(() => {
      this.confirmationIsProgress = false;
    });
  }


  ngOnDestroy(): void {
    if (this.onDestroyPage) {
      this.onDestroyPage();
    }

    if (this.updateContractTimer) {
      window.clearTimeout(this.updateContractTimer);
    }
  }

  public checkRate(revert?) {

    const baseCoinAmount = new BigNumber(this.requestData.tokens_info.base.amount)
      .div(Math.pow(10, this.requestData.tokens_info.base.token.decimals));

    const quoteCoinAmount = new BigNumber(this.requestData.tokens_info.quote.amount)
      .div(Math.pow(10, this.requestData.tokens_info.quote.token.decimals));



    return !revert ?
      baseCoinAmount.div(quoteCoinAmount).dp(4) :
      quoteCoinAmount.div(baseCoinAmount).dp(4);
  }


  public changedToken(coin) {
    setTimeout(() => {
      switch (coin) {
        case 'base':
          this.BaseTokenChange.emit(this.requestData.tokens_info[coin].token.decimals);
          break;
        case 'quote':
          this.QuoteTokenChange.emit(this.requestData.tokens_info[coin].token.decimals);
          break;
      }
    });
  }

}



@Injectable()
export class ContractEditResolver implements Resolve<any> {
  private currentUser;
  private route;

  constructor(
    private contractsService: ContractsService,
    private userService: UserService,
    private httpService: HttpService,
    private web3Service: Web3Service,
    private router: Router
  ) {}

  private contractId: number;
  private publicLink: string;


  private getContractInformation(observer, isPublic?) {

    let promise;

    if (!isPublic) {
      promise = this.contractsService.getContract(this.contractId);
    } else {
      promise = this.contractsService.getContractByPublic(this.publicLink);
    }

    promise.then((result) => {
      result.contract_details.tokens_info = {};

      let newState;
      switch (result.contract_type) {
        case 21:
          switch (result.state) {
            case 'CREATED':
            case 'WAITING_FOR_ACTIVATION':
              newState = `/view-v2/${result.id}`;
              break;
            default:
              if (isPublic) {
                newState = `/public-v2/${this.publicLink}`;
              } else {
                newState = `/contract-v2/${result.id}`;
              }
              break;
          }
          break;
        case 20:
          switch (result.state) {
            case 'CREATED':
            case 'WAITING_FOR_PAYMENT':
            case 'WAITING_FOR_DEPLOYMENT':
              newState = `/view/${result.id}`;
              break;
            default:
              if (isPublic) {
                newState = `/public/${this.publicLink}`;
              } else {
                newState = `/contract/${result.id}`;
              }
              break;
          }
          break;
      }
      if (this.route._routerState.url !== newState) {
          this.router.navigate([newState]);
          return;
      }

      this.web3Service.getFullTokenInfo(result.contract_details.quote_address).then((token: TokenInfoInterface) => {
        result.contract_details.tokens_info.quote = {
          token,
          amount: result.contract_details.quote_limit
        };
        if (result.contract_details.tokens_info.base) {
          observer.complete();
        }
      });

      this.web3Service.getFullTokenInfo(result.contract_details.base_address).then((token: TokenInfoInterface) => {
        result.contract_details.tokens_info.base = {
          token,
          amount: result.contract_details.base_limit
        };
        if (result.contract_details.tokens_info.quote) {
          observer.complete();
        }
      });

      observer.next(result);
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
              this.router.navigate(['/']);
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
