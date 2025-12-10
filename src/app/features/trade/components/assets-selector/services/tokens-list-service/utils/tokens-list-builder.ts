import { TokensStoreService } from '@app/core/services/tokens/tokens-store.service';
import { Token } from '@shared/models/tokens/token';

import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { List } from 'immutable';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { BlockchainName } from '@cryptorubic/core';
import { compareTokens } from '@app/shared/utils/utils';
import { SwapsFormService } from '@app/features/trade/services/swaps-form/swaps-form.service';
import { isMinimalToken } from '@app/shared/utils/is-token';
import { sorterByChain, sorterByTokenRank, TokensSorter } from './sorters';
import { AssetsSelectorStateService } from '../../assets-selector-state/assets-selector-state.service';
import { TokenConvertersService } from '@app/core/services/tokens/token-converters.service';
import { Web3Pure } from '@cryptorubic/web3';

export class TokensListBuilder {
  private tempTokensList: List<AvailableTokenAmount> = List([]);

  constructor(
    private readonly tokensStoreService: TokensStoreService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly swapFormService: SwapsFormService,
    private readonly tokenConverters: TokenConvertersService
  ) {}

  public initList(tokensList?: List<TokenAmount>): TokensListBuilder {
    if (tokensList) {
      this.tempTokensList = this.addAvailableFavoriteFields(tokensList);
      return this;
    }

    if (this.assetsSelectorStateService.assetType === 'allChains') {
      const allChainsFilter = this.assetsSelectorStateService.tokenFilter;
      this.tempTokensList = this.addAvailableFavoriteFields(
        this.tokensStoreService.allChainsTokens[allChainsFilter]
      );
    } else {
      this.tempTokensList = this.addAvailableFavoriteFields(
        this.tokensStoreService.tokens.filter(
          t => t.blockchain === this.assetsSelectorStateService.assetType
        )
      );
    }

    return this;
  }

  public toArray(): AvailableTokenAmount[] {
    return this.tempTokensList.toArray();
  }

  public toList(): List<AvailableTokenAmount> {
    return this.tempTokensList;
  }

  public applyFilterByChain(blockchain: BlockchainName): TokensListBuilder {
    this.tempTokensList = this.tempTokensList.filter(t => t.blockchain === blockchain);
    return this;
  }

  public applyFilterOnlyWithBalancesAndTopTokens(): TokensListBuilder {
    this.tempTokensList = this.tempTokensList.filter(t => t.rank >= 7 || t.amount.gt(0));
    return this;
  }

  /**
   * add filter of tokens list on UI without api requests
   */
  public applyFilterByQueryOnClient(query: string): TokensListBuilder {
    // @TODO fix search for non evm by address
    if (query.startsWith('0x')) {
      this.tempTokensList = this.tempTokensList.filter(token =>
        token.address.toLowerCase().includes(query)
      );
    } else {
      this.tempTokensList = this.tempTokensList.filter(
        token =>
          token.symbol.toLowerCase().includes(query) || token.name.toLowerCase().includes(query)
      );
    }

    return this;
  }

  /**
   * used when you sure tokens has filled 'available' field
   */
  public applyDefaultSort(): TokensListBuilder {
    const tokensArr = this.tempTokensList.toArray();
    this.tempTokensList = this.sortTokens(tokensArr, sorterByChain);

    return this;
  }

  public applySortByTokenRank(): TokensListBuilder {
    const tokensArr = this.tempTokensList.toArray();
    this.tempTokensList = this.sortTokens(tokensArr, sorterByTokenRank);

    return this;
  }

  private addAvailableFavoriteFields(tokensList: List<TokenAmount>): List<AvailableTokenAmount> {
    return tokensList.map(token => ({
      ...token,
      available: this.isTokenAvailable(token),
      favorite: this.isTokenFavorite(token)
    })) as List<AvailableTokenAmount>;
  }

  /**
   * Sorts tokens by comparator.
   * @param tokens Tokens to perform with.
   * @return AvailableTokenAmount[] Filtered and sorted tokens.
   */
  private sortTokens(
    tokens: AvailableTokenAmount[],
    sorter: TokensSorter
  ): List<AvailableTokenAmount> {
    const nativeTokenIndex = tokens.findIndex(token => {
      try {
        const isNative = Web3Pure.isNativeAddress(token.blockchain, token.address);
        return isNative;
      } catch {
        return false;
      }
    });
    if (nativeTokenIndex === -1 || this.assetsSelectorStateService.assetType === 'allChains') {
      return List(tokens.sort(sorter));
    } else {
      const slicedTokensArray = [
        ...tokens.slice(0, nativeTokenIndex),
        ...tokens.slice(nativeTokenIndex + 1, tokens.length)
      ];
      return List([tokens[nativeTokenIndex], ...slicedTokensArray.sort(sorter)]);
    }
  }

  private isTokenFavorite(token: TokenAmount): boolean {
    return this.tokensStoreService.favoriteTokens.some(favoriteToken =>
      compareTokens(favoriteToken, token)
    );
  }

  private isTokenAvailable(token: TokenAmount): boolean {
    const oppositeToken = this.oppositeToken();
    return !oppositeToken || !compareTokens(oppositeToken, token);
  }

  private oppositeToken(): Token | null {
    const oppositeAssetTypeKey =
      this.assetsSelectorStateService.formType === 'from' ? 'toToken' : 'fromToken';
    const oppositeAsset = this.swapFormService.inputValue[oppositeAssetTypeKey];

    return isMinimalToken(oppositeAsset) ? oppositeAsset : null;
  }
}
