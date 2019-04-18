import {AfterContentInit, Component, EventEmitter, Injectable, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
  eth_contract?: any;
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
}


export interface IContract {
  isSwapped?: boolean;
  contract_details?: IContractDetails;
  id?: number|undefined;
  contract_type?: 20;
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
  public confirmationIsProgress: boolean;
  public formIsSending: boolean;

  public currentUser;
  public editableContract = true;

  public minTime;
  public minDate: moment.Moment;

  public datePickerDate;
  public datePickerTime;

  private updateContractTimer;

  public changeModel = new EventEmitter<any>();
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
  private formData: IContract;


  public openedForm: any;

  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
  @ViewChild('extraForm') public extraForm;




  constructor(
    private contractsService: ContractsService,
    private userService: UserService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router
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


    if (this.originalContract) {
      this.analyzeContractState(this.originalContract);
    } else {
      this.gotToForm(0);
    }
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

  private analyzeContractState(contract) {

    const tokensInfo = this.originalContract.contract_details.tokens_info;
    this.originalContract = contract;
    this.originalContract.contract_details.tokens_info = tokensInfo;

    switch (contract.state) {
      case 'CREATED':
        this.gotToForm(2);
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

  private checkContractState() {
    this.updateContractTimer = setTimeout(() => {
      this.contractsService.getContract(this.originalContract.id).then((contract) => {
        this.analyzeContractState(contract);
      });
    }, 5000);
  }


  ngOnInit() {
    const draftData = localStorage.getItem('form_values');
    if (this.originalContract) {
      this.requestData = {...this.originalContract.contract_details};
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
    }
  }

  get tokens() {
    return this.originalContract.contract_details.tokens_info;
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
    const baseCoin = this.requestData.tokens_info.base;

    this.requestData.tokens_info.base = this.requestData.tokens_info.quote;
    this.requestData.tokens_info.quote = baseCoin;

    setTimeout(() => {
      this.changeModel.emit();
    });
  }


  public addCustomToken(name) {
    this.requestData.tokens_info[name].token = this.customTokens[name];
    this.openedCustomTokens[name] = false;
  }

  public setCustomToken(field, token) {
    this.customTokens[field] = token;
  }

  private contractIsCreated(contract) {
    this.location.replaceState(`/view/${contract.id}`);
    this.formData.id = contract.id;
    this.originalContract = contract;
    this.originalContract.contract_details.tokens_info = this.requestData.tokens_info;
    this.gotToForm(2);
  }

  private contractIsError(error) {
  }

  private sendContractData(data) {
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

  public createContract(tokenForm) {
    this.formData.contract_details = {...tokenForm.value};
    this.formData.contract_details.public = !!this.extraForm.value.public;
    this.formData.contract_details.stop_date = this.extraForm.value.active_to.utc().format('YYYY-MM-DD HH:mm');
    this.formData.contract_details.base_limit = (new BigNumber(this.requestData.tokens_info.base.amount)).
      times(Math.pow(10, this.requestData.tokens_info.base.token.decimals)).toString(10);
    this.formData.contract_details.quote_limit = (new BigNumber(this.requestData.tokens_info.quote.amount)).
      times(Math.pow(10, this.requestData.tokens_info.quote.token.decimals)).toString(10);

    this.formData.contract_details.owner_address = this.extraForm.value.owner_address;
    this.formData.name = this.requestData.tokens_info.base.token.token_short_name + '<>' + this.requestData.tokens_info.quote.token.token_short_name;


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
    console.log(this.extraForm.value.active_to);
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
    if (this.updateContractTimer) {
      window.clearTimeout(this.updateContractTimer);
    }
  }

}



@Injectable()
export class ContractEditResolver implements Resolve<any> {
  private currentUser;
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

      this.web3Service.getFullTokenInfo(result.contract_details.quote_address).then((token: TokenInfoInterface) => {
        result.contract_details.tokens_info.quote = {
          token,
          amount: new BigNumber(result.contract_details.quote_limit).div(Math.pow(10, token.decimals)).toString()
        };
        if (result.contract_details.tokens_info.base) {
          observer.complete();
        }
      });

      this.web3Service.getFullTokenInfo(result.contract_details.base_address).then((token: TokenInfoInterface) => {
        result.contract_details.tokens_info.base = {
          token,
          amount: new BigNumber(result.contract_details.base_limit).div(Math.pow(10, token.decimals)).toString()
        };
        if (result.contract_details.tokens_info.quote) {
          observer.complete();
        }
      });

      observer.next(result);
    });
  }

  resolve(route: ActivatedRouteSnapshot) {

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
