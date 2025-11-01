import { Injectable } from '@angular/core';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';

import { BalanceToken } from '@shared/models/tokens/balance-token';
import { MinimalToken } from '@shared/models/tokens/minimal-token';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import {
  BlockchainName,
  BlockchainsInfo,
  Injector,
  Web3PublicService,
  Web3Pure
} from '@cryptorubic/sdk';
import BigNumber from 'bignumber.js';
import { map } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { List } from 'immutable';
import { AssetListType, UtilityAssetType } from '@features/trade/models/asset';
import { BlockchainTokenState } from '@core/services/tokens/models/new-token-types';
import { Token } from '@shared/models/tokens/token';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { compareTokens } from '@shared/utils/utils';
import { SwapFormInput } from '@features/trade/models/swap-form-controls';
import { LosersUtilityStore } from '@core/services/tokens/models/losers-utility-store';
import { TrendingUtilityStore } from '@core/services/tokens/models/tranding-utility-store';
import { GainersUtilityStore } from '@core/services/tokens/models/gainers-utility-store';
import { AllTokensUtilityStore } from '@core/services/tokens/models/all-tokens-utility-store';
import { FavoriteUtilityStore } from '@core/services/tokens/models/favorite-utility-store';
import { CommonUtilityStore } from '@core/services/tokens/models/common-utility-store';
import { SearchQueryUtilityStore } from '@core/services/tokens/models/search-query-utility-store';

@Injectable({
  providedIn: 'root'
})
export class TokensFacadeService {
  public readonly allTokens = new AllTokensUtilityStore(this.tokensStore, this.apiService).init();

  public readonly trending = new TrendingUtilityStore(this.tokensStore, this.apiService).init();

  public readonly gainers = new GainersUtilityStore(this.tokensStore, this.apiService).init();

  public readonly losers = new LosersUtilityStore(this.tokensStore, this.apiService).init();

  public readonly favorite = new FavoriteUtilityStore(
    this.tokensStore,
    this.apiService,
    this.authService
  ).init();

  public readonly searched = new SearchQueryUtilityStore(this.tokensStore, this.apiService).init();

  public static onTokenImageError($event: Event): void {
    const target = $event.target as HTMLImageElement;
    if (target.src !== DEFAULT_TOKEN_IMAGE) {
      target.src = DEFAULT_TOKEN_IMAGE;
    }
  }

  private get userAddress(): string | undefined {
    return this.authService.userAddress;
  }

  private readonly _tokens$ = new BehaviorSubject<List<BalanceToken>>(List());

  public readonly tokens$: Observable<List<BalanceToken>> = this._tokens$.asObservable();

  public readonly blockchainTokens = this.tokensStore.tokens;

  private readonly _tier1TokensLoaded$ = new BehaviorSubject<boolean>(false);

  public readonly tier1TokensLoaded$ = this._tier1TokensLoaded$.asObservable();

  /**
   * Current tokens list.
   */
  public get tokens(): List<BalanceToken> {
    return this._tokens$.getValue();
  }

  constructor(
    private readonly tokensStore: NewTokensStoreService,
    private readonly apiService: NewTokensApiService,
    private readonly authService: AuthService
  ) {
    this.buildTokenLists();
  }

  private buildTokenLists(): void {
    this.buildTier1List();
    this.buildTier2List();
  }

  private buildTier1List(): void {
    this.apiService.getTopTokens().subscribe(tokens => {
      Object.entries(tokens).forEach(([blockchain, blockchainTokens]) => {
        this.tokensStore.addInitialBlockchainTokens(blockchain as BlockchainName, blockchainTokens);
      });
      const tokensArray = Object.values(tokens)
        .map(el => el.list)
        .flat();
      this.allTokens.updateTokenSync(tokensArray);
      this._tier1TokensLoaded$.next(true);
    });
  }

  private buildTier2List(): void {
    this.apiService.getRestTokens().subscribe(tokens => {
      Object.entries(tokens).forEach(([blockchain, blockchainTokens]) => {
        this.tokensStore.addInitialBlockchainTokens(blockchain as BlockchainName, blockchainTokens);
      });
    });
  }

  public async findToken(token: MinimalToken, _searchBackend = false): Promise<BalanceToken> {
    const foundToken =
      this.tokensStore.tokens[token.blockchain]._tokensObject$.value[token.address];
    if (foundToken) {
      return foundToken;
    }

    // @TODO TOKENS REFACTORING
    // if (searchBackend) {
    //   return firstValueFrom(
    //     this.fetchQueryTokens(token.address, token.blockchain).pipe(
    //       map(backendTokens => backendTokens.get(0))
    //     )
    //   );
    // }

    return null;
  }

  public findTokenSync(token: MinimalToken, _searchBackend = false): BalanceToken | null {
    const foundToken =
      this.tokensStore.tokens[token.blockchain]._tokensObject$.value[token.address];
    if (foundToken) {
      return foundToken;
    }

    return null;
  }

  public async getLatestPrice(token: {
    address: string;
    blockchain: BlockchainName;
  }): Promise<BigNumber | null> {
    // @TODO TOKENS ADD UPDATE
    return firstValueFrom(
      this.apiService
        .fetchQueryTokens(token.address, token.blockchain)
        .pipe(map(backendTokens => new BigNumber(backendTokens?.[0]?.price)))
    );
  }

  public async getAndUpdateTokenBalance(token: {
    address: string;
    blockchain: BlockchainName;
  }): Promise<BigNumber> {
    const chainType = BlockchainsInfo.getChainType(token.blockchain);
    const isAddressCorrectValue = await Web3Pure[chainType].isAddressCorrect(this.userAddress);

    if (
      !this.userAddress ||
      !chainType ||
      !isAddressCorrectValue ||
      !Web3PublicService.isSupportedBlockchain(token.blockchain)
    ) {
      return null;
    }

    try {
      const blockchainAdapter = Injector.web3PublicService.getWeb3Public(token.blockchain);
      const balanceInWei = await blockchainAdapter.getBalance(this.userAddress, token.address);

      const storedToken = this.findTokenSync(token);
      if (!token) return new BigNumber(NaN);

      const balance = Web3Pure.fromWei(balanceInWei, storedToken.decimals);
      if (storedToken && !storedToken.amount.eq(balance)) {
        // @TODO TOKENS
        // const newToken = { ...token, amount: balance };
        // this.updateBalance(newToken)
      }

      return new BigNumber(balance);
    } catch (err) {
      console.debug(err);
      const storedToken = this.findTokenSync(token);
      return storedToken?.amount;
    }
  }

  public async updateTokenBalanceAfterCcrSwap(
    fromToken: {
      address: string;
      blockchain: BlockchainName;
    },
    toToken: {
      address: string;
      blockchain: BlockchainName;
    }
  ): Promise<void> {
    const chainType = BlockchainsInfo.getChainType(fromToken.blockchain);

    if (Web3Pure[chainType].isNativeAddress(fromToken.address)) {
      await this.getAndUpdateTokenBalance(fromToken);
      await this.getAndUpdateTokenBalance(toToken);
    } else {
      await Promise.all([
        this.getAndUpdateTokenBalance(fromToken),
        this.getAndUpdateTokenBalance(toToken),
        this.getAndUpdateTokenBalance({
          address: Web3Pure[chainType].nativeTokenAddress,
          blockchain: fromToken.blockchain
        })
      ]);
    }
  }

  public async updateTokenBalancesAfterItSwap(
    fromToken: {
      address: string;
      blockchain: BlockchainName;
    },
    toToken: {
      address: string;
      blockchain: BlockchainName;
    }
  ): Promise<void> {
    const balancePromises = [
      this.getAndUpdateTokenBalance(fromToken),
      this.getAndUpdateTokenBalance(toToken)
    ];
    const fromChainType = BlockchainsInfo.getChainType(fromToken.blockchain);
    const web3Pure = Web3Pure[fromChainType];

    if (
      !web3Pure.isNativeAddress(fromToken.address) &&
      !web3Pure.isNativeAddress(toToken.address)
    ) {
      balancePromises.concat(
        this.getAndUpdateTokenBalance({
          address: web3Pure.nativeTokenAddress,
          blockchain: fromToken.blockchain
        })
      );
    }
    await Promise.all(balancePromises);
  }

  public fetchQueryTokens(query: string, blockchain: BlockchainName | null): Observable<Token[]> {
    return this.apiService.fetchQueryTokens(query, blockchain).pipe(
      map(backendTokens => {
        return backendTokens.filter(
          token =>
            !(token.name.toLowerCase().includes('tether') && query.toLowerCase().includes('eth'))
        );
        // // @TODO TOKENS ADD BALANCE FETCHING
        // throw Error('Method not implemented.');
        // // return this.balanceLoaderService.getTokensWithBalance(filteredTokens);
      })
    );
  }

  public addFavoriteToken(favoriteToken: BalanceToken): Observable<unknown> {
    return this.favorite.addFavoriteToken(favoriteToken);
  }

  public removeFavoriteToken(token: BalanceToken): Observable<unknown> {
    return this.favorite.removeFavoriteToken(token);
  }

  /**
   * Adds new token to tokens list.
   * @param token Tokens to add.
   */
  public addToken(_token: BalanceToken): void {
    // @TODO TOKENS ADD TOKEN
    // if (!this.tokens.find(t => compareTokens(t, token))) {
    //   const tokens = this.tokens.push(token);
    //   this.updateCommonTokensState(tokens);
    // }
  }

  public addTokenByAddress(
    _address: string,
    _blockchain: BlockchainName
  ): Observable<BalanceToken> {
    // @TODO TOKENS
    throw Error('Method not implemented.');
    // const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
    //   blockchain as EvmBlockchainName
    // );
    // const chainType = BlockchainsInfo.getChainType(blockchain);
    // const balance$ =
    //   this.userAddress && this.authService.userChainType === chainType
    //     ? from(blockchainAdapter.getTokenBalance(this.userAddress, address))
    //     : of(null);
    // const token$ = SdkToken.createToken({ blockchain, address });
    //
    // return forkJoin([token$, balance$]).pipe(
    //   map(([token, amount]) => ({
    //     blockchain,
    //     address,
    //     name: token.name,
    //     symbol: token.symbol,
    //     decimals: token.decimals,
    //     image: '',
    //     rank: 1,
    //     price: null as number | null,
    //     amount: amount || new BigNumber(NaN)
    //   })),
    //   tap((_token: TokenAmount) => {
    //     // @TODO TOKENS ADD TO STORE
    //     // const tokens = this.tokens.push(token);
    //     // this.updateCommonTokensState(tokens);
    //   })
    // );
  }

  public getTokensBasedOnType(
    type: AssetListType,
    searchTokens: boolean = false
  ): BlockchainTokenState | CommonUtilityStore {
    if (BlockchainsInfo.isBlockchainName(type)) {
      return searchTokens ? this.searched : this.blockchainTokens[type];
    }

    const utilityMap: Record<UtilityAssetType, CommonUtilityStore> = {
      allChains: this.allTokens,
      trending: this.trending,
      gainers: this.gainers,
      losers: this.losers,
      favorite: this.favorite
    };

    return utilityMap[type];
  }

  public getTokensList(
    type: AssetListType,
    query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return this.getTokensBasedOnType(type, Boolean(query && query?.length > 2)).tokens$.pipe(
      map((tokens: BalanceToken[]) =>
        // @TODO TOKENS
        tokens
          .map(token => {
            const oppositeToken = direction === 'from' ? inputValue.toToken : inputValue.fromToken;
            const isAvailable = oppositeToken ? !compareTokens(token, oppositeToken) : true;
            return {
              ...token,
              available: isAvailable,
              amount: new BigNumber(NaN)
            };
          })
          .sort((a, b) => {
            const oppositeToken = direction === 'from' ? inputValue.toToken : inputValue.fromToken;
            if (oppositeToken) {
              if (
                a.address === oppositeToken.address &&
                a.blockchain === oppositeToken.blockchain
              ) {
                return 1;
              }
              if (
                b.address === oppositeToken.address &&
                b.blockchain === oppositeToken.blockchain
              ) {
                return -1;
              }
            }

            return a.rank > b.rank ? -1 : 1;
          })
      )
    );
  }

  public fetchNewPage(tokenState: BlockchainTokenState, skipLoading: boolean): void {
    if (!tokenState.allowFetching) {
      return;
    }
    const blockchain = tokenState.blockchain;
    if (!skipLoading) {
      this.blockchainTokens[blockchain]._pageLoading$.next(true);
    }

    this.apiService.getNewPage(tokenState.page + 1, blockchain).subscribe(response => {
      this.tokensStore.addInitialBlockchainTokens(blockchain, response);
      this.blockchainTokens[blockchain]._pageLoading$.next(false);
    });
  }

  public buildSearchedList(query: string, blockchain: BlockchainName | null): void {
    return this.searched.handleSearchQuery(query, blockchain);
  }

  public runFetchConditionally(listType: AssetListType, searchQuery: string | null): void {
    if (BlockchainsInfo.isBlockchainName(listType) && !searchQuery) {
      const tokensObject = this.getTokensBasedOnType(listType) as BlockchainTokenState;
      if (tokensObject.page === 1 && tokensObject.allowFetching) {
        this.fetchNewPage(tokensObject, true);
      }
    }
  }
}
