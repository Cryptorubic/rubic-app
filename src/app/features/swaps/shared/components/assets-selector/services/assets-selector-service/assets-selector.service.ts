import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { FormType } from '@features/swaps/shared/models/form/form-type';
import { AssetsSelectorComponentInput } from '@features/swaps/shared/components/assets-selector/models/assets-selector-component-context';
import { SelectorListType } from '@features/swaps/shared/components/assets-selector/models/selector-list-type';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { Asset, AssetType } from '@features/swaps/shared/models/form/asset';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { BlockchainName } from 'rubic-sdk';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { TokensNetworkService } from '@core/services/tokens/tokens-network.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { INSTANT_TRADE_PROVIDERS } from '@features/swaps/features/instant-trade/constants/providers';
import { notEvmChangeNowBlockchainsList } from '@features/swaps/shared/components/assets-selector/services/blockchains-list-service/constants/blockchains-list';

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
    private readonly tokensStoreService: TokensStoreService,
    private readonly tokensNetworkService: TokensNetworkService,
    private readonly swapFormService: SwapFormService,
    private readonly destroy$: TuiDestroyService
  ) {
    this.subscribeOnAssetChange();
  }

  private isSupportedOnChainNetwork(blockchain: BlockchainName): boolean {
    return Object.entries(INSTANT_TRADE_PROVIDERS).some(
      ([supportedNetwork, providers]) => supportedNetwork === blockchain && providers.length > 0
    );
  }

  private isUserFirstNetworkSelection(
    fromBlockchain: BlockchainName,
    assetTypeKey: 'fromAssetType' | 'toBlockchain'
  ): boolean {
    return (
      !fromBlockchain ||
      assetTypeKey !== 'toBlockchain' ||
      Boolean(
        assetTypeKey === 'toBlockchain' && fromBlockchain && this.swapFormService.inputValue.toToken
      ) ||
      !this.isSupportedOnChainNetwork(fromBlockchain) ||
      fromBlockchain in notEvmChangeNowBlockchainsList
    );
  }

  public initParameters(context: Omit<AssetsSelectorComponentInput, 'idPrefix'>): void {
    this._formType = context.formType;

    const assetTypeKey = this.formType === 'from' ? 'fromAssetType' : 'toBlockchain';
    const assetType = this.swapFormService.inputValue[assetTypeKey];
    const fromBlockchain =
      this.swapFormService.inputValue.fromAsset &&
      'blockchain' in this.swapFormService.inputValue.fromAsset
        ? this.swapFormService.inputValue.fromAsset.blockchain
        : null;

    if (this.isUserFirstNetworkSelection(fromBlockchain, assetTypeKey)) {
      this.assetType = assetType;
    } else {
      this.assetType = fromBlockchain;
    }

    this.selectorListType = 'tokens';
  }

  private subscribeOnAssetChange(): void {
    this.assetType$
      .pipe(filter(Boolean), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(assetType => {
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
    if (this.tokensNetworkService.needRefetchTokens) {
      this.tokensNetworkService.tokensRequestParameters = undefined;
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
    this.tokensStoreService.startBalanceCalculating(blockchainName);
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
