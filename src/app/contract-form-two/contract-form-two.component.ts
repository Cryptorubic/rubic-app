import { Component, OnInit } from '@angular/core';
import {ContractFormComponent, MY_FORMATS} from '../contract-form/contract-form.component';
import {ContractsService} from '../services/contracts/contracts.service';
import {UserService} from '../services/user/user.service';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter} from '@angular/material-moment-adapter';

@Component({
  selector: 'app-contract-form-two',
  templateUrl: '../contract-form/contract-form.component.html',
  styleUrls: ['../contract-form/contract-form.component.scss'],
  providers: [
    Location,
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class ContractFormTwoComponent extends ContractFormComponent {

  public withAdvancedOptions: boolean;

  constructor(
    contractsService: ContractsService,
    userService: UserService,
    location: Location,
    route: ActivatedRoute,
    router: Router
  ) {
    super(
      contractsService,
      userService,
      location,
      route,
      router
    );
    this.withAdvancedOptions = true;
  }

}
