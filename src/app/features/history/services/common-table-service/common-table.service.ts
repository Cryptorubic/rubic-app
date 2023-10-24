import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class CommonTableService {
  private readonly _activeItemIndex$ = new BehaviorSubject<0 | 1>(0);

  public readonly activeItemIndex$ = this._activeItemIndex$.asObservable();

  public set activeItemIndex(value: 0 | 1) {
    this._activeItemIndex$.next(value);
  }
}
