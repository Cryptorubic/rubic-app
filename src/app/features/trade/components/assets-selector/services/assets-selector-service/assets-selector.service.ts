import { Injectable } from '@angular/core';
import { BlockchainName } from '@cryptorubic/sdk';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { FormType } from '@features/trade/models/form-type';
import { Asset, AssetType } from '@features/trade/models/asset';
import { blockchainsList } from '@features/trade/components/assets-selector/services/blockchains-list-service/constants/blockchains-list';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { TokensApiService } from '@app/core/services/backend/tokens-api/tokens-api.service';
import { AssetsSelectorStateService } from '../assets-selector-state/assets-selector-state.service';
import { SearchQueryService } from '../search-query-service/search-query.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TOKEN_FILTERS } from '../../models/token-filters';

@Injectable()
export class AssetsSelectorService {
  public readonly assetType$ = this.assetsSelectorStateService.assetType$;

  private get assetType(): AssetType {
    return this.assetsSelectorStateService.assetType;
  }

  private readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly tokensApiService: TokensApiService,
    private readonly swapFormService: SwapsFormService,
    private readonly destroy$: TuiDestroyService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly headerStore: HeaderStore,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly searchQueryService: SearchQueryService,
    private readonly authService: AuthService
  ) {}

  private checkAndRefetchTokenList(): void {
    if (this.tokensApiService.needRefetchTokens) {
      // @TODO TOKENS
      // this.tokensNetworkStateService.setTokensRequestParameters(undefined);
    }
  }

  public setSelectorListTypeByAssetType(): void {
    this.assetsSelectorStateService.setSelectorListType('tokens');
  }

  public onAllChainsSelect(): void {
    this.assetsSelectorStateService.setAssetType('allChains');
  }

  public openBlockchainsList(): void {
    this.assetsSelectorStateService.setSelectorListType('blockchains');
  }

  public onBlockchainSelect(blockchainName: BlockchainName): void {
    this.assetsSelectorStateService.setAssetType(blockchainName);
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

  private getTokensListAssetType(openedSelector: FormType): AssetType {
    const openedToken = openedSelector === 'from' ? 'fromToken' : 'toToken';
    const oppositeToken = openedSelector === 'from' ? 'toToken' : 'fromToken';

    const isTokenSelected = !!this.swapFormService.inputValue[openedToken]?.blockchain;
    const isOppositeTokenSelected = !!this.swapFormService.inputValue[oppositeToken]?.blockchain;

    if (isTokenSelected) return this.swapFormService.inputValue[openedToken].blockchain;
    if (!isOppositeTokenSelected && !isTokenSelected) {
      this.assetsSelectorStateService.setTokenFilter(TOKEN_FILTERS.ALL_CHAINS_ALL_TOKENS);
      return 'allChains';
    }

    const userBlockchainName = this.walletConnectorService.network;
    const userAvailableBlockchainName = blockchainsList.find(
      chain => chain.name === userBlockchainName
    )?.name;

    if (userAvailableBlockchainName) return userAvailableBlockchainName;

    if (!userAvailableBlockchainName && isOppositeTokenSelected) {
      this.assetsSelectorStateService.setTokenFilter(TOKEN_FILTERS.ALL_CHAINS_ALL_TOKENS);
      return 'allChains';
    }

    this.assetsSelectorStateService.setTokenFilter(TOKEN_FILTERS.ALL_CHAINS_ALL_TOKENS);
    return 'allChains';
  }
}
