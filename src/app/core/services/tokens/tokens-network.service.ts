import { Injectable } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { finalize, forkJoin, Observable } from 'rxjs';
import { first, switchMap, tap } from 'rxjs/operators';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { TokensNetworkStateKey } from '@shared/models/tokens/paginated-tokens';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { TokensApiService } from '@core/services/backend/tokens-api/tokens-api.service';
import { AuthService } from '@core/services/auth/auth.service';
import { compareTokens } from '@shared/utils/utils';
import { List } from 'immutable';
import { Token } from '@shared/models/tokens/token';
import { BalanceLoaderService } from './balance-loader.service';
import { BalanceLoadingStateService } from './balance-loading-state.service';
import { BalancePatcherFacade } from './utils/balance-patcher-facade';
import { AssetsSelectorStateService } from '@app/features/trade/components/assets-selector/services/assets-selector-state/assets-selector-state.service';
import { BalanceLoadingAssetData } from './models/balance-loading-types';
import { TokensNetworkStateService } from './tokens-network-state.service';
import { TokensUpdaterService } from './tokens-updater.service';
import { TokenConvertersService } from './token-converters.service';

@Injectable({
  providedIn: 'root'
})
export class TokensNetworkService {
  private get userAddress(): string | undefined {
    return this.authService.userAddress;
  }

  private readonly balancePatcherFacade: BalancePatcherFacade;

  constructor(
    private readonly tokensStoreService: TokensStoreService,
    private readonly tokensNetworkStateService: TokensNetworkStateService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly balanceLoaderService: BalanceLoaderService,
    private readonly balanceLoadingStateService: BalanceLoadingStateService,
    private readonly tokensApiService: TokensApiService,
    private readonly authService: AuthService,
    private readonly tokensUpdaterService: TokensUpdaterService,
    private readonly tokenConverters: TokenConvertersService
  ) {
    this.balancePatcherFacade = new BalancePatcherFacade(
      this.tokensStoreService,
      this.assetsSelectorStateService,
      this.tokenConverters
    );
  }

  public setupSubscriptions(): void {
    this.tokensNetworkStateService.tokensRequestParameters$
      .pipe(
        switchMap(() => this.tokensApiService.fetchBasicTokensOnPageInit()),
        tap(backendTokens => {
          this.tokensStoreService.updateStorageTokens(backendTokens);
          this.balancePatcherFacade.addNewTokensToList(backendTokens, {
            tokenListToPatch: 'commonTokens'
          });
        }),
        switchMap(backendTokens => {
          const uniqueBlockchains = [...new Set(backendTokens.map(bT => bT.blockchain))];
          return Promise.all(
            uniqueBlockchains.map(blockchain =>
              this.addNewTokensWithBalances(backendTokens, blockchain)
            )
          );
        })
      )
      .subscribe();

    this.tokensNetworkStateService.setTokensRequestParameters(undefined);
  }

  private async addNewTokensWithBalances(
    backendTokens: List<Token>,
    blockchain: BlockchainName
  ): Promise<void> {
    const newAddedTokens = backendTokens.filter(
      bT =>
        bT.blockchain === blockchain &&
        !this.tokensStoreService.tokens.some(t => compareTokens(bT, t))
    );
    const assetDataForBalanceStatus = {
      assetType: this.assetsSelectorStateService.assetType,
      tokenFilter: this.assetsSelectorStateService.tokenFilter
    } as BalanceLoadingAssetData;

    if (
      newAddedTokens.size &&
      this.balanceLoadingStateService.isBalanceCalculated(assetDataForBalanceStatus)
    ) {
      const tokensWithBalances = await this.balanceLoaderService.getTokensWithBalance(
        newAddedTokens
      );
      this.balancePatcherFacade.patchDefaultTokensBalances(tokensWithBalances, {
        tokenListToPatch: 'commonTokens'
      });
    }
  }

  /**
   * Updates pagination state for current TokensNetworkStateKey.
   */
  private updateNetworkPage(key: TokensNetworkStateKey): void {
    const oldState = this.tokensNetworkStateService.tokensNetworkState;
    const newState = {
      ...oldState,
      [key]: {
        ...oldState[key],
        page: oldState[key].page + 1
      }
    };
    this.tokensNetworkStateService.updateTokensNetworkState(newState);
  }

  /**
   * Fetches tokens for specific network.
c   * @param tokensNetworkKey Requested TokensNetworkStateKey.
   * @param updateCallback Callback after tokens fetching.
   */
  public fetchNextPageOfTokensForSelectedAsset(
    tokensNetworkKey: TokensNetworkStateKey,
    updateCallback?: () => void
  ): void {
    forkJoin([
      this.tokensNetworkStateService.tokensNetworkState$.pipe(
        first(state => state[tokensNetworkKey].page >= 1)
      ),
      this.tokensListPaginatedRequest$(tokensNetworkKey)
    ])
      .pipe(
        tap(() => this.updateNetworkPage(tokensNetworkKey)),
        switchMap(async ([_, tokensList]) => {
          if (this.userAddress) {
            // @FIX add dynamic loading
            const tokensWithBalance = await this.balanceLoaderService.getTokensWithBalance(
              tokensList
            );
            if (tokensWithBalance.size) {
              return tokensWithBalance.toArray();
            }
          }
          return tokensList;
        }),
        finalize(() => {
          updateCallback?.();
        })
      )
      .subscribe((tokens: TokenAmount[]) => {
        this.balancePatcherFacade.addNewTokensToList(List(tokens), {
          tokenListToPatch: 'commonTokens'
        });
        this.tokensUpdaterService.triggerUpdateTokens();
      });
  }

  private tokensListPaginatedRequest$(
    tokensNetworkKey: TokensNetworkStateKey
  ): Observable<List<Token>> {
    const page =
      this.tokensNetworkStateService.getNextPageCountForSpecificSelector(tokensNetworkKey);

    return this.tokensApiService.fetchSpecificBackendTokens({
      network: tokensNetworkKey,
      page
    });
  }
}
