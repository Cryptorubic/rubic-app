import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, distinctUntilChanged, skip } from 'rxjs';
import { MAIN_FORM_TYPE, MainFormType } from './models';
import { SwapsFormService } from '../swaps-form/swaps-form.service';
import { TargetNetworkAddressService } from '../target-network-address-service/target-network-address.service';

@Injectable()
export class FormsTogglerService {
  private _selectedForm$ = new BehaviorSubject<MainFormType>(MAIN_FORM_TYPE.SWAP_FORM);

  public readonly selectedForm$ = this._selectedForm$.asObservable();

  public get selectedForm(): MainFormType {
    return this._selectedForm$.getValue();
  }

  constructor(
    private readonly swapsFormService: SwapsFormService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService
  ) {
    this.subscribeOnMainFormTypeChange();
  }

  public openSwapForm(): void {
    this._selectedForm$.next(MAIN_FORM_TYPE.SWAP_FORM);
  }

  private subscribeOnMainFormTypeChange(): void {
    this.selectedForm$.pipe(skip(1), distinctUntilChanged(), delay(50)).subscribe(() => {
      this.swapsFormService.clearForm();
      this.targetNetworkAddressService.clearReceiverAddress();
    });
  }
}
