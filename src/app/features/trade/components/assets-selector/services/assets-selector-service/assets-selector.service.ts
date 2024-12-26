import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { BlockchainName, BlockchainsInfo } from 'rubic-sdk';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { TokensNetworkService } from '@core/services/tokens/tokens-network.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { FormType } from '@features/trade/models/form-type';
import { Asset, AssetType } from '@features/trade/models/asset';
import { SelectorListType } from '@features/trade/components/assets-selector/models/selector-list-type';
import { blockchainsList } from '@features/trade/components/assets-selector/services/blockchains-list-service/constants/blockchains-list';
import { AssetsSelectorComponentInput } from '@features/trade/components/assets-selector/models/assets-selector-component-context';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { TokensApiService } from '@app/core/services/backend/tokens-api/tokens-api.service';
import { FilterQueryService } from '../filter-query-service/filter-query.service';
import { BlockchainTags } from '../../components/blockchains-filter-list/models/BlockchainFilters';

type SelectorType = 'fromBlockchain' | 'toBlockchain';

@Injectable()
export class AssetsSelectorService {
  private _formType: FormType;

  public get formType(): FormType {
    return this._formType;
  }

  private readonly _assetType$ = new BehaviorSubject<AssetType>(undefined);

  public readonly assetType$ = this._assetType$.asObservable();

  /**
   * blockchainName used for loading token's list
   */
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

  private readonly isMobile = this.headerStore.isMobile;

  public get selectorListType(): SelectorListType {
    return this._selectorListType$.value;
  }

  private set selectorListType(value: SelectorListType) {
    this._selectorListType$.next(value);
  }

  constructor(
    private readonly tokensStoreService: TokensStoreService,
    private readonly tokensNetworkService: TokensNetworkService,
    private readonly tokensApiService: TokensApiService,
    private readonly swapFormService: SwapsFormService,
    private readonly destroy$: TuiDestroyService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly headerStore: HeaderStore,
    private readonly filterQueryService: FilterQueryService
  ) {
    this.subscribeOnAssetChange();
  }

  public initParameters(context: Omit<AssetsSelectorComponentInput, 'idPrefix'>): void {
    this._formType = context.formType;

    const assetTypeKey = this.formType === 'from' ? 'fromBlockchain' : 'toBlockchain';
    const fromBlockchain = this.swapFormService.inputValue.fromToken?.blockchain;
    const toBlockchain = this.swapFormService.inputValue.toToken?.blockchain;
    const userBlockchainName = this.walletConnectorService.network;
    const userAvailableBlockchainName = blockchainsList.find(
      chain => chain.name === userBlockchainName
    )?.name;

    const noChainInOpenedSelector =
      (this.formType === 'from' && !fromBlockchain) || (this.formType === 'to' && !toBlockchain);

    if (noChainInOpenedSelector) {
      this.assetType = 'allChains';
    } else {
      this.assetType = this.getTokenListChain(assetTypeKey) || userAvailableBlockchainName;
    }

    this.selectorListType = 'tokens';
  }

  private subscribeOnAssetChange(): void {
    this.assetType$.pipe(distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(assetType => {
      if (BlockchainsInfo.isBlockchainName(assetType)) {
        const assetKey = this.formType === 'from' ? 'fromBlockchain' : 'toToken';
        if (!this.swapFormService.inputValue[assetKey]) {
          const assetTypeKey = this.formType === 'from' ? 'fromBlockchain' : 'toBlockchain';
          if (this.swapFormService.inputValue[assetTypeKey] !== assetType) {
            this.swapFormService.inputControl.patchValue({
              [assetTypeKey]: this.assetType
            });
          }
        }
        this.checkAndRefetchTokenList();
      }
      if (assetType === 'allChains') {
        this.filterQueryService.filterQuery = BlockchainTags.ALL;
      }
    });
  }

  private checkAndRefetchTokenList(): void {
    if (this.tokensApiService.needRefetchTokens) {
      this.tokensNetworkService.setTokensRequestParameters(undefined);
    }
  }

  public setSelectorListTypeByAssetType(): void {
    this.selectorListType = this.assetType === 'fiat' ? 'fiats' : 'tokens';
  }

  public onAllChainsSelect(): void {
    this.assetType = 'allChains';
    this.tokensStoreService.startBalanceCalculating('allChains');
  }

  public openBlockchainsList(): void {
    this.selectorListType = 'blockchains';
  }

  public onBlockchainSelect(blockchainName: BlockchainName): void {
    this.assetType = blockchainName;
    this.tokensStoreService.startBalanceCalculating(blockchainName);
    if (!this.isMobile) {
      this.selectorListType = 'tokens';
    }
  }

  public onAssetSelect(asset: Asset): void {
    if (this._formType === 'from') {
      this.gtmService.fireSelectInputTokenEvent(asset.name);
    }
    if (this._formType === 'to') {
      this.gtmService.fireSelectOutputTokenEvent(asset.name);
    }
    this._assetSelected$.next(asset);
  }

  public getAssetType(formType: FormType): AssetType {
    const assetTypeKey = formType === 'from' ? 'fromBlockchain' : 'toBlockchain';
    return this.swapFormService.inputValue[assetTypeKey];
  }

  private getTokenListChain(selectorType: SelectorType): BlockchainName | null {
    const tokenKey = selectorType === 'fromBlockchain' ? 'fromToken' : 'toToken';
    const oppositeTokenKey = selectorType === 'fromBlockchain' ? 'toToken' : 'fromToken';
    const isTokenSelected = !!this.swapFormService.inputValue[tokenKey]?.blockchain;
    const isOppositeTokenSelected = !!this.swapFormService.inputValue[oppositeTokenKey]?.blockchain;

    if (!isTokenSelected && isOppositeTokenSelected) {
      return this.swapFormService.inputValue[oppositeTokenKey].blockchain;
    }
    if (isTokenSelected) {
      return this.swapFormService.inputValue[tokenKey].blockchain;
    }

    return null;
  }
}
