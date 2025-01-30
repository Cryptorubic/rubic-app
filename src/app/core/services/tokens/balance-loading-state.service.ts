import { Injectable } from '@angular/core';
import { AssetType } from '@app/features/trade/models/asset';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BalanceLoadingStateService {
  private isBalanceAlreadyCalculatedForChain: Record<AssetType, boolean> = [
    ...Object.values(BLOCKCHAIN_NAME),
    'allChains'
  ].reduce(
    (acc, blockchain) => ({ ...acc, [blockchain]: false }),
    {} as Record<AssetType, boolean>
  );

  private _isBalanceLoading$: Record<AssetType, BehaviorSubject<boolean>> = [
    ...Object.values(BLOCKCHAIN_NAME),
    'allChains'
  ].reduce(
    (acc, blockchain) => ({ ...acc, [blockchain]: new BehaviorSubject(true) }),
    {} as Record<AssetType, BehaviorSubject<boolean>>
  );

  constructor() {}

  public resetBalanceCalculatingStatuses(): void {
    this.isBalanceAlreadyCalculatedForChain = Object.keys(
      this.isBalanceAlreadyCalculatedForChain
    ).reduce(
      (acc, assetType) => ({ ...acc, [assetType]: false }),
      {} as Record<AssetType, boolean>
    );
  }

  public setBalanceLoading(asset: AssetType, isLoading: boolean): void {
    this._isBalanceLoading$[asset]?.next(isLoading);
  }

  public setBalanceCalculated(asset: AssetType, isCalculated: boolean): void {
    this.isBalanceAlreadyCalculatedForChain[asset] = isCalculated;
  }

  public isBalanceCalculated(blockchain: AssetType): boolean {
    return this.isBalanceAlreadyCalculatedForChain[blockchain];
  }

  public isBalanceLoading$(blockchain: AssetType): Observable<boolean> {
    return this._isBalanceLoading$[blockchain].asObservable();
  }
}
