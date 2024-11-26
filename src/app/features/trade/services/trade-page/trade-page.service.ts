import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

type FormType = 'form' | 'fromSelector' | 'toSelector' | 'preview' | 'depositPreview';

@Injectable()
export class TradePageService {
  private readonly _formContent$ = new BehaviorSubject<FormType>('form');

  public readonly formContent$ = this._formContent$.asObservable();

  private readonly _showProviders$ = new BehaviorSubject<boolean>(false);

  public readonly showProviders$ = this._showProviders$.asObservable().pipe(debounceTime(50));

  constructor() {}

  public setState(value: FormType): void {
    this._formContent$.next(value);
  }

  public setProvidersVisibility(value: boolean): void {
    this._showProviders$.next(value);
  }
}
