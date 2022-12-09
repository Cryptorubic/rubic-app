import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { TokensService } from '@core/services/tokens/tokens.service';
import { FormType } from '@features/swaps/shared/models/form/form-type';
import { AssetsSelectorComponentInput } from '@features/swaps/shared/components/assets-selector/models/assets-selector-component-context';
import { SelectorListType } from '@features/swaps/shared/components/assets-selector/models/selector-list-type';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { Asset, AssetType } from '@features/swaps/shared/models/form/asset';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { BlockchainName } from 'rubic-sdk';

@Injectable()
export class AssetsSelectorService {
  private _formType: FormType;

  public get formType(): FormType {
    return this._formType;
  }

  private readonly _assetType$ = new BehaviorSubject<AssetType>(undefined);

  public readonly assetType$ = this._assetType$.asObservable();

  public get assetType(): AssetType {
    return this._assetType$.value;
  }

  private set assetType(value: AssetType) {
    this._assetType$.next(value);
  }

  private readonly _assetSelected$ = new Subject<Asset>();

  public readonly assetSelected$ = this._assetSelected$.asObservable();

  private readonly _selectorListType$ = new BehaviorSubject<SelectorListType>(undefined);

  public readonly selectorListType$ = this._selectorListType$.asObservable();

  public get selectorListType(): SelectorListType {
    return this._selectorListType$.value;
  }

  private set selectorListType(value: SelectorListType) {
    this._selectorListType$.next(value);
  }

  constructor(
    private readonly tokensService: TokensService,
    private readonly swapFormService: SwapFormService
  ) {
    this.subscribeOnAssetChange();
  }

  public initParameters(context: Omit<AssetsSelectorComponentInput, 'idPrefix'>): void {
    this._formType = context.formType;

    const assetTypeKey = this.formType === 'from' ? 'fromAssetType' : 'toBlockchain';
    const assetType = this.swapFormService.inputValue[assetTypeKey];
    this.assetType = assetType;
    this.selectorListType = assetType === 'fiat' ? 'fiats' : 'tokens';
  }

  private subscribeOnAssetChange(): void {
    this.assetType$.pipe(filter(Boolean), distinctUntilChanged()).subscribe(assetType => {
      const assetKey = this.formType === 'from' ? 'fromAsset' : 'toToken';
      if (!this.swapFormService.inputValue[assetKey]) {
        const assetTypeKey = this.formType === 'from' ? 'fromAssetType' : 'toBlockchain';
        if (this.swapFormService.inputValue[assetTypeKey] !== assetType) {
          this.swapFormService.inputControl.patchValue({
            [assetTypeKey]: this.assetType
          });
        }
      }

      this.checkAndRefetchTokenList();
    });
  }

  private checkAndRefetchTokenList(): void {
    if (this.tokensService.needRefetchTokens) {
      this.tokensService.tokensRequestParameters = undefined;
    }
  }

  public setSelectorListTypeByAssetType(): void {
    this.selectorListType = this.assetType === 'fiat' ? 'fiats' : 'tokens';
  }

  public openFiatsList(): void {
    this.assetType = 'fiat';
    this.selectorListType = 'fiats';
  }

  public openBlockchainsList(): void {
    this.selectorListType = 'blockchains';
  }

  public onBlockchainSelect(blockchainName: BlockchainName): void {
    this.assetType = blockchainName;
    this.selectorListType = 'tokens';
  }

  public onAssetSelect(asset: Asset): void {
    this._assetSelected$.next(asset);
  }

  public getAssetType(formType: FormType): AssetType {
    const assetTypeKey = formType === 'from' ? 'fromAssetType' : 'toBlockchain';
    return this.swapFormService.inputValue[assetTypeKey];
  }
}
