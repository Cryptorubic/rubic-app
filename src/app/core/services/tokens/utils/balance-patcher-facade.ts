import { List } from 'immutable';
import { AssetsSelectorStateService } from '@app/features/trade/components/assets-selector/services/assets-selector-state/assets-selector-state.service';
import { TokensStoreService } from '../tokens-store.service';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { Token } from '@app/shared/models/tokens/token';
import { EntitiesForAddingNewTokens } from '../models/balance-loading-types';
import { TOKEN_FILTERS } from '@app/features/trade/components/assets-selector/models/token-filters';
import { TokenConvertersService } from '../token-converters.service';
import { PatchingFuncOptions } from '../models/all-chains-tokens';

export class BalancePatcherFacade {
  constructor(
    private readonly tokensStoreService: TokensStoreService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly tokenConverters: TokenConvertersService
  ) {}

  /**
   * @description Method combines tokens from storage.get('RUBIC_TOKENS') with tokens from backend
   * and tokens from backend have high priority
   * @param newTokens tokens from backend
   */
  public addNewTokensToList(
    newTokens: List<Token | TokenAmount>,
    options: PatchingFuncOptions
  ): void {
    const { tokensList, updateListSubject } = this.getTokensListAndListUpdaterByAsset(options);

    const newTokensMap = this.tokenConverters.convertTokensListToMap(newTokens);
    const oldTokensMap = this.tokenConverters.convertTokensListToMap(tokensList);

    const tokensListWithNewTokens = tokensList
      .map(token => {
        const tokenInPrevList = oldTokensMap.get(this.tokenConverters.getTokenKeyInMap(token));
        const tokenInNewList = newTokensMap.get(this.tokenConverters.getTokenKeyInMap(token));
        if (tokenInPrevList && tokenInNewList) {
          newTokensMap.delete(this.tokenConverters.getTokenKeyInMap(token));
          return {
            ...tokenInPrevList,
            ...tokenInNewList,
            amount: !tokenInNewList.amount.isNaN() ? tokenInNewList.amount : tokenInPrevList.amount
          };
        } else {
          return tokenInPrevList;
        }
      })
      .concat(newTokensMap.values());

    const tokenFilter =
      options.allChainsFilterToPatch ?? this.assetsSelectorStateService.tokenFilter;

    updateListSubject(tokensListWithNewTokens, tokenFilter);
  }

  private getTokensListAndListUpdaterByAsset(
    options: PatchingFuncOptions
  ): EntitiesForAddingNewTokens {
    if (options.tokenListToPatch === 'tokens$') {
      return {
        tokensList: this.tokensStoreService.tokens,
        updateListSubject: this.tokensStoreService.updateCommonTokensState.bind(
          this.tokensStoreService
        )
      };
    }

    // @FIX check if it works
    if (
      options.tokenListToPatch === 'allChainsTokens$' &&
      this.assetsSelectorStateService.assetType === 'allChains'
    ) {
      const tokenFilter =
        options.allChainsFilterToPatch ?? this.assetsSelectorStateService.tokenFilter;

      return {
        tokensList: this.tokensStoreService.allChainsTokens[tokenFilter],
        updateListSubject: this.tokensStoreService.updateAllChainsTokensState.bind(
          this.tokensStoreService
        )
      };
    }

    return {
      tokensList: this.tokensStoreService.tokens,
      updateListSubject: this.tokensStoreService.updateCommonTokensState.bind(
        this.tokensStoreService
      )
    };
  }

  /**
   * @description use if searchQuery !== ""
   * used to dynamically update tokensToShow balances in `fetchQueryTokensDynamicallyAndPatch`
   * */
  public patchQueryTokensBalances(tokensWithBalances: List<TokenAmount>): void {
    const tokensWithBalancesMap = this.tokenConverters.convertTokensListToMap(tokensWithBalances);

    const lastQueriedTokensWithBalances = this.tokensStoreService.lastQueriedTokens.map(token => {
      const foundTokenWithBalance = tokensWithBalancesMap.get(
        this.tokenConverters.getTokenKeyInMap(token)
      );

      if (!foundTokenWithBalance) {
        return token;
      } else {
        return { ...token, amount: foundTokenWithBalance.amount };
      }
    });

    this.tokensStoreService.updateLastQueriedTokensState(lastQueriedTokensWithBalances);
  }

  /**
   * @description use if searchQuery === ""
   */
  public patchDefaultTokensBalances(
    tokensWithBalances: List<TokenAmount>,
    options: { patchAllTokensInAllChains?: boolean } = { patchAllTokensInAllChains: false }
  ): void {
    const hasDifferentChains = tokensWithBalances.some(
      t => tokensWithBalances.get(0).blockchain !== t.blockchain
    );

    if (hasDifferentChains) {
      this.patchAllChainsTokensBalances(tokensWithBalances, options);
    } else {
      this.patchCommonTokensBalances(tokensWithBalances);
    }
  }

  public patchNullBalancesCommonTokensList(): void {
    const nullTokens = this.tokenConverters.getTokensWithNullBalances(
      this.tokensStoreService.tokens,
      false
    );

    this.tokensStoreService.updateCommonTokensState(nullTokens);
  }

  public patchNullBalancesEveryFilterListAllChains(): void {
    const nullAllTokens = this.tokenConverters.getTokensWithNullBalances(
      this.tokensStoreService.allChainsTokens.ALL_CHAINS_ALL_TOKENS,
      false
    );
    const nullGainers = this.tokenConverters.getTokensWithNullBalances(
      this.tokensStoreService.allChainsTokens.ALL_CHAINS_GAINERS,
      false
    );
    const nullLosers = this.tokenConverters.getTokensWithNullBalances(
      this.tokensStoreService.allChainsTokens.ALL_CHAINS_LOSERS,
      false
    );
    const nullTrendings = this.tokenConverters.getTokensWithNullBalances(
      this.tokensStoreService.allChainsTokens.ALL_CHAINS_TRENDING,
      false
    );

    this.tokensStoreService.updateAllChainsTokensState(
      nullAllTokens,
      TOKEN_FILTERS.ALL_CHAINS_ALL_TOKENS
    );
    this.tokensStoreService.updateAllChainsTokensState(
      nullGainers,
      TOKEN_FILTERS.ALL_CHAINS_GAINERS
    );
    this.tokensStoreService.updateAllChainsTokensState(nullLosers, TOKEN_FILTERS.ALL_CHAINS_LOSERS);
    this.tokensStoreService.updateAllChainsTokensState(
      nullTrendings,
      TOKEN_FILTERS.ALL_CHAINS_TRENDING
    );
  }

  /* sets balances for tokens in _tokens$ list  */
  private patchCommonTokensBalances(tokensWithBalances: List<TokenAmount>): void {
    const tokensWithBalancesMap = this.tokenConverters.convertTokensListToMap(tokensWithBalances);

    const tokens = this.tokensStoreService.tokens.map(token => {
      const foundTokenWithBalance = tokensWithBalancesMap.get(
        this.tokenConverters.getTokenKeyInMap(token)
      );

      if (!foundTokenWithBalance) {
        return token;
      } else {
        return { ...token, amount: foundTokenWithBalance.amount };
      }
    });

    this.tokensStoreService.updateCommonTokensState(tokens);
  }

  /* sets balances for tokens in _allChainsTokens$ list  */
  private patchAllChainsTokensBalances(
    tokensWithBalances: List<TokenAmount>,
    options: { patchAllTokensInAllChains?: boolean } = { patchAllTokensInAllChains: false }
  ): void {
    const allChainsFilter = options.patchAllTokensInAllChains
      ? TOKEN_FILTERS.ALL_CHAINS_ALL_TOKENS
      : this.assetsSelectorStateService.tokenFilter;
    const allChainsTokensByFilter = this.tokensStoreService.allChainsTokens[allChainsFilter];
    const tokensWithBalancesMap = this.tokenConverters.convertTokensListToMap(tokensWithBalances);

    const updatedTokens = allChainsTokensByFilter.map(token => {
      const foundTokenWithBalance = tokensWithBalancesMap.get(
        this.tokenConverters.getTokenKeyInMap(token)
      );

      if (!foundTokenWithBalance) {
        return token;
      } else {
        return { ...token, amount: foundTokenWithBalance.amount };
      }
    });

    this.tokensStoreService.updateAllChainsTokensState(updatedTokens, allChainsFilter);
  }
}
