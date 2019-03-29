import {AfterContentInit, AfterViewInit, Component, EventEmitter, Injectable, OnInit, ViewChild} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDatepicker} from '@angular/material';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {ContractsService} from '../services/contracts/contracts.service';
import {ActivatedRoute, ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {UserService} from '../services/user/user.service';
import {Observable} from 'rxjs';

import * as moment from 'moment';
import {UserInterface} from '../services/user/user.interface';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {TokenInfoInterface, Web3Service} from '../services/web3/web3.service';
import {HttpService} from '../services/http/http.service';

const BigNumber = require('bignumber.js');


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
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true }},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class ContractFormComponent implements AfterContentInit, OnInit {

  private currentUser;

  private formData: {
    contract_details?: {
      base_address: string;
      quote_address: string;
      base_limit: string;
      quote_limit: string;
      stop_date: number;
      owner_address: string;
      public: boolean|undefined;
      tokens_info?: any;
    },
    id?: number|undefined;
    contract_type: 20;
    network: 1
  };

  public minTime;

  public datePickerDate;
  public datePickerTime;

  public minDate: moment.Moment;

  public requestData: any;
  public changeModel = new EventEmitter<any>();
  public customTokens;
  public openedCustomTokens: {
    base: boolean;
    quote: boolean;
  };

  private originalContract;


  public openedForm: any;

  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;

  @ViewChild('extraForm') public extraForm;

  constructor(
    private contractsService: ContractsService,
    private userService: UserService,
    private location: Location,
    private route: ActivatedRoute
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
    this.openedForm = this.originalContract ? 'preview' : 'tokens';

    this.currentUser = this.userService.getUserModel();
    this.userService.getCurrentUser().subscribe((userProfile: UserInterface) => {
      this.currentUser = userProfile;
    });

    this.minDate = moment().add(1, 'hour');
    this.datePickerDate = this.minDate;
    this.datePickerTime = `${this.minDate.hour()}:${this.minDate.minutes()}`;


  }

  ngOnInit() {
    const draftData = localStorage.getItem('form_values');
    this.requestData = draftData ? JSON.parse(draftData) : {
      base: {},
      quote: {}
    };
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.dateChange();
    });

    if (this.route.snapshot.data.contract) {
      this.formData.id = this.originalContract.id;
      this.requestData = {...this.originalContract.tokens_info};
      this.requestData.owner_address = this.originalContract.contract_details.owner_address;
      this.requestData.public = this.originalContract.contract_details.public;
      this.datePickerDate = moment(this.originalContract.contract_details.stop_date);
      this.datePickerTime = `${this.datePickerDate.hour()}:${this.datePickerDate.minutes()}`;
    }
  }


  public revertCoins() {
    const baseCoin = this.requestData.base;
    this.requestData = {
      base: this.requestData.quote,
      quote: baseCoin
    };
    setTimeout(() => {
      this.changeModel.emit();
    });
  }


  public addCustomToken(name) {
    this.requestData[name].token = {
      token_short_name: this.customTokens[name].symbol,
      token_name: this.customTokens[name].name,
      address: this.customTokens[name].address,
      decimals: this.customTokens[name].decimals
    };
    this.openedCustomTokens[name] = false;
  }

  public setCustomToken(field, token) {
    this.customTokens[field] = token;
  }

  private contractIsCreated(contract) {
    this.location.replaceState(`/view/${contract.id}`);
    this.originalContract = contract;
  }

  private contractIsError(error) {
  }

  private sendContractData(data) {
    this.contractsService.createContract(this.formData)
      .then((result) => {
        this.contractIsCreated(result);
      }, (err) => {
        this.contractIsError(err);
      });
  }

  public createContract(tokenForm) {
    this.formData.contract_details = {...tokenForm.value};
    this.formData.contract_details.public = !!this.extraForm.value.public;
    this.formData.contract_details.stop_date = this.extraForm.value.active_to.format('YYYY-MM-DD HH:mm');

    this.formData.contract_details.base_limit =
      (new BigNumber(this.requestData.base.amount)).times(Math.pow(10, this.requestData.base.token.decimals)).toString(10);
    this.formData.contract_details.quote_limit =
      (new BigNumber(this.requestData.quote.amount)).times(Math.pow(10, this.requestData.quote.token.decimals)).toString(10);

    this.formData.contract_details.owner_address = this.extraForm.value.owner_address;
    
    if (this.currentUser.is_ghost) {
      this.userService.openAuthForm().then(() => {
        this.sendContractData(this.formData);
      });
    } else {
      this.sendContractData(this.formData);
    }
    // this.contractsService.createContract(this.requestData);

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
}


@Injectable()
export class ContractEditResolver implements Resolve<any> {
  constructor(
    private contractsService: ContractsService,
    private userService: UserService,
    private web3Service: Web3Service,
    private httpService: HttpService
  ) {}

  private convertTokenInfo(tokenInfo) {
    return {
      token_short_name: tokenInfo.symbol,
      token_name: tokenInfo.name,
      address: tokenInfo.address,
      decimals: tokenInfo.decimals
    };
  }

  private getTokenInfo(tokenAddress) {

    return new Promise((resolve, reject) => {
      this.httpService.get('get_all_tokens/', {
        address: tokenAddress
      }).toPromise().then((result) => {
        if (!result.length) {
          this.web3Service.getTokenInfo(tokenAddress).then((tokenInfo: {data: TokenInfoInterface}) => {
            resolve(this.convertTokenInfo(tokenInfo.data));
          });
        } else {
          resolve(result[0]);
        }
      });
    });
  }

  resolve(route: ActivatedRouteSnapshot) {
    return new Observable((observer) => {
      const subscription = this.userService.getCurrentUser(false, true).subscribe((user) => {
        if (!user.is_ghost) {
          this.contractsService.getContract(route.params.id).then((result) => {

            result.tokens_info = {};

            this.getTokenInfo(result.contract_details.quote_address).then((token: TokenInfoInterface) => {
              result.tokens_info.quote = {
                token,
                amount: new BigNumber(result.contract_details.quote_limit).div(Math.pow(10, token.decimals)).toString()
              };
              if (result.tokens_info.base) {
                observer.complete();
              }
            });

            this.getTokenInfo(result.contract_details.base_address).then((token: TokenInfoInterface) => {
              result.tokens_info.base = {
                token,
                amount: new BigNumber(result.contract_details.base_limit).div(Math.pow(10, token.decimals)).toString()
              };
              if (result.tokens_info.quote) {
                observer.complete();
              }
            });
            console.log(result.tokens_info);
            observer.next(result);
          });
        } else {
          observer.next(null);
          observer.complete();
        }
        subscription.unsubscribe();
      });
      return {
        unsubscribe() {}
      };
    });
  }
}
