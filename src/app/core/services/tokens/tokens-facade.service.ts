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
import { map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { List } from 'immutable';
import { compareTokens } from '@shared/utils/utils';
import { AssetListType } from '@features/trade/models/asset';
import {
  BlockchainTokenState,
  TokenRef,
  UtilityState
} from '@core/services/tokens/models/new-token-types';
import { RatedToken, Token } from '@shared/models/tokens/token';

@Injectable({
  providedIn: 'root'
})
export class TokensFacadeService {
  private readonly _favoriteTokens$ = new BehaviorSubject<List<BalanceToken>>(List());

  public readonly favoriteTokens$ = this._favoriteTokens$.asObservable();

  public readonly allTokens = this.tokensStore.all;

  public readonly trending = this.tokensStore.trending;

  public readonly gainers = this.tokensStore.gainers;

  public readonly losers = this.tokensStore.losers;

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
    this.buildTrendingList();
    this.buildGainersList();
    this.buildLosersList();
  }

  private buildTier1List(): void {
    this.apiService.getTopTokens().subscribe(tokens => {
      Object.entries(tokens).forEach(([blockchain, blockchainTokens]) => {
        this.tokensStore.addInitialBlockchainTokens(blockchain as BlockchainName, blockchainTokens);
      });
      this.buildAllTokensList(tokens);
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

  public fetchQueryTokens(
    query: string,
    blockchain: BlockchainName | null
  ): Observable<List<BalanceToken>> {
    return this.apiService.fetchQueryTokens(query, blockchain).pipe(
      switchMap(backendTokens => {
        const _filteredTokens = backendTokens.filter(
          token =>
            !(token.name.toLowerCase().includes('tether') && query.toLowerCase().includes('eth'))
        );

        // @TODO TOKENS ADD BALANCE FETCHING
        throw Error('Method not implemented.');
        // return this.balanceLoaderService.getTokensWithBalance(filteredTokens);
      })
    );
  }

  /**
   * Adds token to list of favorite tokens.
   * @param favoriteToken Favorite token to add.
   */
  public addFavoriteToken(favoriteToken: BalanceToken): Observable<unknown> {
    return this.apiService.addFavoriteToken(favoriteToken).pipe(
      tap((_avoriteTokenBalance: BigNumber) => {
        // @TODO TOKENS USE NEW SCHEME
        if (!this._favoriteTokens$.value.some(token => compareTokens(token, favoriteToken))) {
          this._favoriteTokens$.next(this._favoriteTokens$.value.push(favoriteToken));
        }
      })
    );
  }

  /**
   * Removes token from list of favorite tokens.
   * @param token Favorite token to remove.
   */
  public removeFavoriteToken(token: BalanceToken): Observable<unknown> {
    // @TODO TOKENS USE NEW SCHEME
    const filteredTokens = this._favoriteTokens$.value.filter(el => !compareTokens(el, token));
    return this.apiService.deleteFavoriteToken(token).pipe(
      tap(() => {
        if (
          this._favoriteTokens$.value.some(favoriteToken => compareTokens(token, favoriteToken))
        ) {
          this._favoriteTokens$.next(filteredTokens);
        }
      })
    );
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

  public getTokensBasedOnType(type: AssetListType): BlockchainTokenState | UtilityState {
    if (type === 'allChains') {
      return this.allTokens;
    }
    if (type === 'trending') {
      return this.trending;
    }
    if (type === 'gainers') {
      return this.gainers;
    }
    if (type === 'losers') {
      return this.losers;
    }
    if (BlockchainsInfo.isBlockchainName(type)) {
      return this.blockchainTokens[type];
    }
  }

  private buildAllTokensList(
    tokens: Partial<Record<BlockchainName, { list: Token[]; total: number; haveMore: boolean }>>
  ): void {
    this.allTokens._pageLoading$.next(true);
    const allTokens: TokenRef[] = [];
    const metaTokensArray = Object.values(tokens);

    metaTokensArray.forEach(blockchainTokens => {
      blockchainTokens.list.forEach(token => {
        allTokens.push({
          address: token.address,
          blockchain: token.blockchain
        });
      });
    });
    this.allTokens._refs$.next(allTokens);
    this.allTokens._pageLoading$.next(false);
  }

  private buildTrendingList(): void {
    this.trending._pageLoading$.next(true);
    this.apiService.fetchTrendTokens().subscribe(tokens => {
      this.addMissedUtilityTokens(tokens);
      const trendingTokens: TokenRef[] = tokens.map(token => ({
        address: token.address,
        blockchain: token.blockchain
      }));
      this.trending._refs$.next(trendingTokens);
      this.trending._pageLoading$.next(false);
    });
  }

  private buildGainersList(): void {
    this.gainers._pageLoading$.next(true);
    this.apiService.fetchGainersTokens().subscribe(tokens => {
      this.addMissedUtilityTokens(tokens);
      const gainersTokens: TokenRef[] = tokens.map(token => ({
        address: token.address,
        blockchain: token.blockchain
      }));
      this.gainers._refs$.next(gainersTokens);
      this.gainers._pageLoading$.next(false);
    });
  }

  private buildLosersList(): void {
    this.losers._pageLoading$.next(true);
    this.apiService.fetchLosersTokens().subscribe(tokens => {
      this.addMissedUtilityTokens(tokens);
      const losersTokens: TokenRef[] = tokens.map(token => ({
        address: token.address,
        blockchain: token.blockchain
      }));
      this.losers._refs$.next(losersTokens);
      this.losers._pageLoading$.next(false);
    });
  }

  private addMissedUtilityTokens(tokens: RatedToken[]): void {
    const chainObject = {} as Partial<Record<BlockchainName, RatedToken[]>>;
    tokens.forEach(token => {
      if (token.blockchain in chainObject === false) {
        Object.assign(chainObject, { [token.blockchain]: [] });
      }
      chainObject[token.blockchain] = [...chainObject?.[token.blockchain], token];
    });
    Object.entries(chainObject).forEach(([blockchain, blockchainTokens]) => {
      const existingTokens =
        this.tokensStore.tokens[blockchain as BlockchainName]._tokensObject$.value;
      const missedTokens = blockchainTokens.filter(token => !existingTokens[token.address]);
      if (missedTokens.length) {
        this.tokensStore.addNewBlockchainTokens(blockchain as BlockchainName, missedTokens);
      }
    });
  }

  public fetchNewPage(tokenState: BlockchainTokenState): void {}
}
