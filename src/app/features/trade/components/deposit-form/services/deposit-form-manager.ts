import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DEPOSIT_FORM_STATE, DepositFormState } from '../models/deposit-form-states';

@Injectable()
export class DepositFormManager {
  private readonly _depositFormState$ = new BehaviorSubject<DepositFormState>(
    DEPOSIT_FORM_STATE.IDLE
  );

  public readonly depositFormState$ = this._depositFormState$.asObservable();

  public setDepositFormState(state: DepositFormState): void {
    this._depositFormState$.next(state);
  }
}
