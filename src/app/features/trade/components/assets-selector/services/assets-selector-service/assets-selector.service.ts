import { Injectable } from '@angular/core';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { BlockchainName, BlockchainsInfo } from 'rubic-sdk';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { TokensNetworkService } from '@core/services/tokens/tokens-network.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { FormType } from '@features/trade/models/form-type';
import { Asset, AssetType } from '@features/trade/models/asset';
import { blockchainsList } from '@features/trade/components/assets-selector/services/blockchains-list-service/constants/blockchains-list';
import { AssetsSelectorComponentInput } from '@features/trade/components/assets-selector/models/assets-selector-component-context';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { TokensApiService } from '@app/core/services/backend/tokens-api/tokens-api.service';
import { AssetsSelectorStateService } from '../assets-selector-state/assets-selector-state.service';
import { SearchQueryService } from '../search-query-service/search-query.service';

type SelectorType = 'fromBlockchain' | 'toBlockchain';

@Injectable()
export class AssetsSelectorService {
  public readonly assetType$ = this.assetsSelectorStateService.assetType$;

  private get assetType(): AssetType {
    return this.assetsSelectorStateService.assetType;
  }

  private readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly tokensStoreService: TokensStoreService,
    private readonly tokensNetworkService: TokensNetworkService,
    private readonly tokensApiService: TokensApiService,
    private readonly swapFormService: SwapsFormService,
    private readonly destroy$: TuiDestroyService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly headerStore: HeaderStore,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly searchQueryService: SearchQueryService
  ) {
    this.subscribeOnAssetChange();
  }

  public initParameters(context: Omit<AssetsSelectorComponentInput, 'idPrefix'>): void {
    this.assetsSelectorStateService.setFormType(context.formType);

    const assetTypeKey =
      this.assetsSelectorStateService.formType === 'from' ? 'fromBlockchain' : 'toBlockchain';
    const fromBlockchain = this.swapFormService.inputValue.fromToken?.blockchain;
    const toBlockchain = this.swapFormService.inputValue.toToken?.blockchain;
    const userBlockchainName = this.walletConnectorService.network;
    const userAvailableBlockchainName = blockchainsList.find(
      chain => chain.name === userBlockchainName
    )?.name;

    const noChainInOpenedSelector =
      (this.assetsSelectorStateService.formType === 'from' && !fromBlockchain) ||
      (this.assetsSelectorStateService.formType === 'to' && !toBlockchain);

    if (noChainInOpenedSelector) {
      this.assetsSelectorStateService.setAssetType('allChains');
    } else {
      const assetType = this.getTokenListChain(assetTypeKey) || userAvailableBlockchainName;
      this.assetsSelectorStateService.setAssetType(assetType);
    }

    this.assetsSelectorStateService.setSelectorListType('tokens');
    this.tokensStoreService.startBalanceCalculating(this.assetType);
  }

  private subscribeOnAssetChange(): void {
    this.assetType$.pipe(distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(assetType => {
      this.searchQueryService.query = '';
      if (BlockchainsInfo.isBlockchainName(assetType)) {
        const assetKey =
          this.assetsSelectorStateService.formType === 'from' ? 'fromBlockchain' : 'toToken';
        if (!this.swapFormService.inputValue[assetKey]) {
          const assetTypeKey =
            this.assetsSelectorStateService.formType === 'from' ? 'fromBlockchain' : 'toBlockchain';
          if (this.swapFormService.inputValue[assetTypeKey] !== assetType) {
            this.swapFormService.inputControl.patchValue({
              [assetTypeKey]: this.assetType
            });
          }
        }
        this.checkAndRefetchTokenList();
      }
    });
  }

  private checkAndRefetchTokenList(): void {
    if (this.tokensApiService.needRefetchTokens) {
      this.tokensNetworkService.setTokensRequestParameters(undefined);
    }
  }

  public setSelectorListTypeByAssetType(): void {
    this.assetsSelectorStateService.setSelectorListType(
      this.assetType === 'fiat' ? 'fiats' : 'tokens'
    );
  }

  public onAllChainsSelect(): void {
    this.assetsSelectorStateService.setAssetType('allChains');
    this.tokensStoreService.startBalanceCalculating('allChains');
  }

  public openBlockchainsList(): void {
    this.assetsSelectorStateService.setSelectorListType('blockchains');
  }

  public onBlockchainSelect(blockchainName: BlockchainName): void {
    this.assetsSelectorStateService.setAssetType(blockchainName);
    this.tokensStoreService.startBalanceCalculating(blockchainName);
    if (!this.isMobile) {
      this.assetsSelectorStateService.setSelectorListType('tokens');
    }
  }

  public onAssetSelect(asset: Asset): void {
    if (this.assetsSelectorStateService.formType === 'from') {
      this.gtmService.fireSelectInputTokenEvent(asset.name);
    }
    if (this.assetsSelectorStateService.formType === 'to') {
      this.gtmService.fireSelectOutputTokenEvent(asset.name);
    }
    this.assetsSelectorStateService.setAssetSelected(asset);
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
