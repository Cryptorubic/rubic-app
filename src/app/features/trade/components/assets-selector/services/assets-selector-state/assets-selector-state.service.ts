import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SelectorListType } from '../../models/selector-list-type';

@Injectable({ providedIn: 'root' })
export class AssetsSelectorStateService {
  private readonly _selectorListType$ = new BehaviorSubject<SelectorListType>(undefined);

  public readonly selectorListType$ = this._selectorListType$.asObservable();
}
