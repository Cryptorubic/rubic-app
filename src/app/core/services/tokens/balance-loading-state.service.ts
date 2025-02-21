import { Injectable } from '@angular/core';
import {
  TOKEN_FILTERS,
  TokenFilter
} from '@app/features/trade/components/assets-selector/models/token-filters';
import { AssetType } from '@app/features/trade/models/asset';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import { BehaviorSubject, Observable } from 'rxjs';
import { BalanceLoadingAssetData } from './models/balance-loading-types';

@Injectable({
  providedIn: 'root'
})
export class BalanceLoadingStateService {
  private isBalanceAlreadyCalculatedForChain: Record<AssetType, boolean> = [
    ...Object.values(BLOCKCHAIN_NAME)
  ].reduce(
    (acc, blockchain) => ({ ...acc, [blockchain]: false }),
    {} as Record<AssetType, boolean>
  );

  private isBalanceAlreadyCalculatedForAllChainsFilter: Record<TokenFilter, boolean> =
    Object.values(TOKEN_FILTERS).reduce(
      (acc, tokenFilter) => ({ ...acc, [tokenFilter]: false }),
      {} as Record<TokenFilter, boolean>
    );

  private _isBalanceLoading$: Record<AssetType, BehaviorSubject<boolean>> = [
    ...Object.values(BLOCKCHAIN_NAME)
  ].reduce(
    (acc, blockchain) => ({ ...acc, [blockchain]: new BehaviorSubject(true) }),
    {} as Record<AssetType, BehaviorSubject<boolean>>
  );

  private _isBalanceLoadingAllChains$: Record<TokenFilter, BehaviorSubject<boolean>> =
    Object.values(TOKEN_FILTERS).reduce(
      (acc, tokenFilter) => ({ ...acc, [tokenFilter]: new BehaviorSubject(true) }),
      {} as Record<TokenFilter, BehaviorSubject<boolean>>
    );

  constructor() {}

  public resetBalanceCalculatingStatuses(): void {
    this.isBalanceAlreadyCalculatedForChain = Object.keys(
      this.isBalanceAlreadyCalculatedForChain
    ).reduce(
      (acc, assetType) => ({ ...acc, [assetType]: false }),
      {} as Record<AssetType, boolean>
    );

    this.isBalanceAlreadyCalculatedForAllChainsFilter = Object.keys(
      this.isBalanceAlreadyCalculatedForAllChainsFilter
    ).reduce(
      (acc, tokenFilter) => ({ ...acc, [tokenFilter]: false }),
      {} as Record<TokenFilter, boolean>
    );
  }

  public setBalanceLoading(assetData: BalanceLoadingAssetData, isLoading: boolean): void {
    if (assetData.assetType === 'allChains' || assetData.tokenFilter) {
      this._isBalanceLoadingAllChains$[assetData.tokenFilter].next(isLoading);
    } else {
      this._isBalanceLoading$[assetData.assetType]?.next(isLoading);
    }
  }

  public setBalanceCalculated(assetData: BalanceLoadingAssetData, isCalculated: boolean): void {
    if (assetData.assetType === 'allChains' || assetData.tokenFilter) {
      this.isBalanceAlreadyCalculatedForAllChainsFilter[assetData.tokenFilter] = isCalculated;
    } else {
      this.isBalanceAlreadyCalculatedForChain[assetData.assetType] = isCalculated;
    }
  }

  public isBalanceCalculated(assetData: BalanceLoadingAssetData): boolean {
    if (assetData.assetType === 'allChains') {
      return this.isBalanceAlreadyCalculatedForAllChainsFilter[assetData.tokenFilter];
    }
    return this.isBalanceAlreadyCalculatedForChain[assetData.assetType];
  }

  public isBalanceLoading$(assetData: BalanceLoadingAssetData): Observable<boolean> {
    if (assetData.assetType === 'allChains') {
      return this._isBalanceLoadingAllChains$[assetData.tokenFilter].asObservable();
    }
    return this._isBalanceLoading$[assetData.assetType].asObservable();
  }

  public isBalanceLoading(assetData: BalanceLoadingAssetData): boolean {
    if (assetData.assetType === 'allChains') {
      return this._isBalanceLoadingAllChains$[assetData.tokenFilter].value;
    }
    return this._isBalanceLoading$[assetData.assetType].value;
  }
}
