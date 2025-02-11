import { List } from 'immutable';
import { AssetsSelectorStateService } from '@app/features/trade/components/assets-selector/services/assets-selector-state/assets-selector-state.service';
import { TokensStoreService } from '../tokens-store.service';
import { convertTokensListToMap, getTokenKeyInMap } from './convert-tokens-list-to-map';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { Token } from '@app/shared/models/tokens/token';
import { EntitiesForAddingNewTokens } from '../models/balance-loading-types';
import { TOKEN_FILTERS } from '@app/features/trade/components/assets-selector/models/token-filters';

export class BalancePatcherFacade {
  constructor(
    private readonly tokensStoreService: TokensStoreService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService
  ) {}

  /**
   * @description Method combines tokens from storage.get('RUBIC_TOKENS') with tokens from backend
   * and tokens from backend have high priority
   * @param newTokens tokens from backend
   */
  public addNewTokensToList(newTokens: List<Token | TokenAmount>): void {
    const { tokensList, updateListSubject } = this.getTokensListAndListUpdaterByAsset();

    const newTokensMap = convertTokensListToMap(newTokens);
    const oldTokensMap = convertTokensListToMap(tokensList);

    const tokensListWithNewTokens = tokensList
      .map(token => {
        const tokenInPrevList = oldTokensMap.get(getTokenKeyInMap(token));
        const tokenInNewList = newTokensMap.get(getTokenKeyInMap(token));
        if (tokenInPrevList && tokenInNewList) {
          newTokensMap.delete(getTokenKeyInMap(token));
          return { ...tokenInPrevList, ...tokenInNewList };
        } else {
          return tokenInPrevList;
        }
      })
      .concat(newTokensMap.values());

    console.log('addNewTokensToList ==> ', 'color: yellow;', {
      tokensListWithNewTokens: tokensListWithNewTokens.toArray(),
      newTokens: newTokens.toArray()
    });
    // @FIX GAINERS/LOSERS patching
    updateListSubject(tokensListWithNewTokens, this.assetsSelectorStateService.tokenFilter);
  }

  private getTokensListAndListUpdaterByAsset(): EntitiesForAddingNewTokens {
    if (this.assetsSelectorStateService.assetType === 'allChains') {
      return {
        tokensList:
          this.tokensStoreService.allChainsTokens[this.assetsSelectorStateService.tokenFilter],
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
    const tokensWithBalancesMap = convertTokensListToMap(tokensWithBalances);

    const lastQueriedTokensWithBalances = this.tokensStoreService.lastQueriedTokens.map(token => {
      const foundTokenWithBalance = tokensWithBalancesMap.get(getTokenKeyInMap(token));

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

  /* sets balances for tokens in _tokens$ list  */
  private patchCommonTokensBalances(tokensWithBalances: List<TokenAmount>): void {
    const tokensWithBalancesMap = convertTokensListToMap(tokensWithBalances);

    const tokens = this.tokensStoreService.tokens.map(token => {
      const foundTokenWithBalance = tokensWithBalancesMap.get(getTokenKeyInMap(token));

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
    const tokensWithBalancesMap = convertTokensListToMap(tokensWithBalances);

    const updatedTokens = allChainsTokensByFilter.map(token => {
      const foundTokenWithBalance = tokensWithBalancesMap.get(getTokenKeyInMap(token));

      if (!foundTokenWithBalance) {
        return token;
      } else {
        return { ...token, amount: foundTokenWithBalance.amount };
      }
    });

    this.tokensStoreService.updateAllChainsTokensState(updatedTokens, allChainsFilter);
  }
}
