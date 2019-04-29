import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ContractFormComponent, MY_FORMATS} from '../contract-form/contract-form.component';
import {ContractsService} from '../services/contracts/contracts.service';
import {UserService} from '../services/user/user.service';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {Web3Service} from '../services/web3/web3.service';

import {SWAPS_V2} from './contract-v2-details';

@Component({
  selector: 'app-contract-form-two',
  templateUrl: './contract-form-two.component.html',
  styleUrls: ['../contract-form/contract-form.component.scss'],
  providers: [
    Location,
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class ContractFormTwoComponent extends ContractFormComponent {

  constructor(
    contractsService: ContractsService,
    userService: UserService,
    location: Location,
    route: ActivatedRoute,
    router: Router,
    web3Ser: Web3Service
  ) {

    super(
      contractsService,
      userService,
      location,
      route,
      router
    );
    this.web3Service = web3Ser;
    this.setContractType(21);
    this.copiedData = {};
    this.providedAddresses = {};

    this.onDestroyPage = () => {
      if (this.getAccountsTimeout) {
        this.getAccountsTimeout.unsubscribe();
      }
    };

    this.transaction = {};
  }

  @ViewChild('advancedForm') public advancedForm;

  public transaction;
  public copiedData;
  public providedAddresses;
  private getAccountsTimeout;
  protected web3Service;
  private trxRequest;

  private getAccountsSubscriber;


  public confirmContract() {
    if (this.confirmationIsProgress) {
      return;
    }
    this.confirmationIsProgress = true;
    this.contractsService.changeContractState(this.formData.id).then((contract) => {
      this.analyzeContractState(contract);
    }, (err) => {

    }).finally(() => {
      this.confirmationIsProgress = false;
    });
  }

  protected analyzeContractState(contract) {

    const tokensInfo = this.originalContract.contract_details.tokens_info;
    this.originalContract = contract;
    this.originalContract.contract_details.tokens_info = tokensInfo;

    switch (contract.state) {
      case 'CREATED':
        this.gotToForm(100);
        break;
      case 'WAITING_FOR_ACTIVATION':
        this.editableContract = false;
        this.gotToForm(101);
        this.checkContractState();
        this.generateActivateTrx();
        this.updateAddresses();
        break;
      default:
        this.router.navigate(['/contract-v2/' + contract.id]);
        break;
    }
  }

  public sendActivateTrx(wallet) {
    this.web3Service.sendTransaction({
      from: wallet.address,
      to: this.transaction.to,
      data: this.transaction.data
    }, wallet.type).then((result) => {
      console.log(result);
    }, (err) => {
      console.log(err);
    });
  }


  private generateActivateTrx() {

    const details = this.originalContract.contract_details;
    const interfaceMethod = this.web3Service.getMethodInterface('createOrder', SWAPS_V2.ABI);
    this.trxRequest = [
      details.memo_contract,
      details.base_address,
      details.quote_address,
      details.base_limit,
      details.quote_limit,
      (new Date(details.stop_date)).getTime(),
      details.whitelist ? details.whitelist_address : '0x0000000000000000000000000000000000000000',
      details.min_base_wei || '0',
      details.min_quote_wei || '0'
    ];

    const methodSignature = this.web3Service.encodeFunctionCall(interfaceMethod, this.trxRequest);

    this.transaction = {
      request: this.trxRequest,
      from: this.originalContract.contract_details.owner_address,
      to: SWAPS_V2.ADDRESS,
      data: methodSignature
    };
  }


  private updateAddresses() {
    if (this.getAccountsSubscriber) {
      return;
    }
    this.getAccountsSubscriber = this.web3Service.getAccounts(this.originalContract.contract_details.owner_address).subscribe((addresses) => {
      if (addresses !== null) {
        this.providedAddresses = addresses;
      } else {
        this.providedAddresses = {};
      }
    });
  }



  public onCopied(field) {
    if (this.copiedData[field]) {
      return;
    }
    this.copiedData[field] = true;
    setTimeout(() => {
      this.copiedData[field] = false;
    }, 1000);
  }



}
