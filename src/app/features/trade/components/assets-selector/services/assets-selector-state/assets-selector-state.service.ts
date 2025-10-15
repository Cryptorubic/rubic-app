import { Injectable } from '@angular/core';
import { Asset, AssetType } from '@app/features/trade/models/asset';
import { BehaviorSubject, Subject } from 'rxjs';
import { SelectorListType } from '../../models/selector-list-type';

@Injectable({ providedIn: 'root' })
export class AssetsSelectorStateService {
  private readonly _assetType$ = new BehaviorSubject<AssetType>(undefined);

  public readonly assetType$ = this._assetType$.asObservable();

  private readonly _assetSelected$ = new Subject<Asset>();

  public readonly assetSelected$ = this._assetSelected$.asObservable();

  private readonly _selectorListType$ = new BehaviorSubject<SelectorListType>(undefined);

  public readonly selectorListType$ = this._selectorListType$.asObservable();
}
