import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MAIN_FORM_TYPE, MainFormType } from './models';

@Injectable({
  providedIn: 'root'
})
export class FormsTogglerService {
  private _selectedForm$ = new BehaviorSubject<MainFormType>(MAIN_FORM_TYPE.SWAP_FORM);

  public readonly selectedForm$ = this._selectedForm$.asObservable();

  public openSwapForm(): void {
    this._selectedForm$.next(MAIN_FORM_TYPE.SWAP_FORM);
  }

  public openGasForm(): void {
    this._selectedForm$.next(MAIN_FORM_TYPE.GAS_FORM);
  }
}
