import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type FormType = 'form' | 'fromSelector' | 'toSelector' | 'preview';

@Injectable({
  providedIn: 'root'
})
export class TradePageService {
  private readonly _formContent$ = new BehaviorSubject<FormType>('form');

  public readonly formContent$ = this._formContent$.asObservable();

  constructor() {}

  public setState(value: FormType): void {
    this._formContent$.next(value);
  }
}
