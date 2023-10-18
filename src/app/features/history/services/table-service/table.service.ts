import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private readonly _activeItemIndex$ = new BehaviorSubject<0 | 1 | 2>(0);

  public readonly activeItemIndex$ = this._activeItemIndex$.asObservable();

  public set activeItemIndex(value: 0 | 1 | 2) {
    this._activeItemIndex$.next(value);
  }

  constructor() {}
}
