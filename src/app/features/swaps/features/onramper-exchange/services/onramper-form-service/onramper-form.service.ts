import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class OnramperFormService {
  private readonly _widgetOpened$ = new BehaviorSubject<boolean>(false);

  public readonly widgetOpened$ = this._widgetOpened$.asObservable();

  public set widgetOpened(value: boolean) {
    this._widgetOpened$.next(value);
  }

  constructor() {}
}
