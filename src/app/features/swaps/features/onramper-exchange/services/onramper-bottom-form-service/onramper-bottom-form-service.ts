import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnramperBottomFormService {
  private readonly _widgetOpened$ = new BehaviorSubject<boolean>(false);

  public readonly widgetOpened$ = this._widgetOpened$.asObservable();

  public set widgetOpened(value: boolean) {
    this._widgetOpened$.next(value);
  }

  constructor() {}
}
