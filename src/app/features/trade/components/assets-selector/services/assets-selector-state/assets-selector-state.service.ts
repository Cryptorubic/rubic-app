import { Injectable } from '@angular/core';
import { Asset, AssetType } from '@app/features/trade/models/asset';
import { BehaviorSubject, Subject } from 'rxjs';
import { SelectorListType } from '../../models/selector-list-type';
import { FormType } from '@app/features/trade/models/form-type';

@Injectable({ providedIn: 'root' })
export class AssetsSelectorStateService {
  private _formType: FormType;

  public get formType(): FormType {
    return this._formType;
  }

  private readonly _assetType$ = new BehaviorSubject<AssetType>(undefined);

  public readonly assetType$ = this._assetType$.asObservable();

  private readonly _assetSelected$ = new Subject<Asset>();

  public readonly assetSelected$ = this._assetSelected$.asObservable();

  private readonly _selectorListType$ = new BehaviorSubject<SelectorListType>(undefined);

  public readonly selectorListType$ = this._selectorListType$.asObservable();

  /**
   * blockchainName used for loading token's list
   */
  public get assetType(): AssetType {
    return this._assetType$.value;
  }

  constructor() {}

  public setFormType(formType: FormType): void {
    this._formType = formType;
  }

  public setAssetType(value: AssetType): void {
    this._assetType$.next(value);
  }

  public setAssetSelected(asset: Asset): void {
    this._assetSelected$.next(asset);
  }

  public setSelectorListType(listType: SelectorListType): void {
    this._selectorListType$.next(listType);
  }
}
