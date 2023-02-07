import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  finalize,
  firstValueFrom,
  forkJoin,
  from,
  Observable,
  of,
  Subject
} from 'rxjs';
import { List } from 'immutable';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { TokensNetworkState } from '@shared/models/tokens/paginated-tokens';
import { TOKENS_PAGINATION } from '@core/services/tokens/constants/tokens-pagination';
import { catchError, first, map, switchMap, tap, timeout } from 'rxjs/operators';
import { TokensApiService } from '@core/services/backend/tokens-api/tokens-api.service';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { Token } from '@shared/models/tokens/token';
import BigNumber from 'bignumber.js';
import { areTokensEqual } from '@core/services/tokens/utils';
import {
  BlockchainName,
  BlockchainsInfo,
  EvmBlockchainName,
  Injector,
  Web3PublicSupportedBlockchain,
  Web3Pure
} from 'rubic-sdk';
import { Token as SdkToken } from 'rubic-sdk/lib/common/tokens/token';
import { MinimalToken } from '@shared/models/tokens/minimal-token';
import { TO_BACKEND_BLOCKCHAINS } from '@shared/constants/blockchain/backend-blockchains';
import { compareAddresses, compareObjects, compareTokens } from '@shared/utils/utils';
import { TokensRequestQueryOptions } from '@core/services/backend/tokens-api/models/tokens';
import { StoreService } from '@core/services/store/store.service';

@Injectable({
  providedIn: 'root'
})
export class TokensStoreService {
  /**
   * Current tokens list state.
   */
  private readonly _tokens$ = new BehaviorSubject<List<TokenAmount>>(undefined);

  public readonly tokens$: Observable<List<TokenAmount>> = this._tokens$.asObservable();

  /**
   * Current tokens list.
   */
  get tokens(): List<TokenAmount> {
    return this._tokens$.getValue();
  }

  /**
   * Current favorite tokens list state.
   */
  private readonly _favoriteTokens$ = new BehaviorSubject<List<TokenAmount>>(List());

  public readonly favoriteTokens$ = this._favoriteTokens$.asObservable();

  /**
   * Current favorite tokens list.
   */
  get favoriteTokens(): List<TokenAmount> {
    return this._favoriteTokens$.getValue();
  }

  /**
   * Current tokens request options state.
   */
  private readonly _tokensRequestParameters$ = new Subject<{ [p: string]: unknown }>();

  /**
   * Sets new tokens request options.
   */
  set tokensRequestParameters(parameters: { [p: string]: unknown }) {
    this._tokensRequestParameters$.next(parameters);
  }

  /**
   * Current tokens network state.
   */
  private readonly _tokensNetworkState$ = new BehaviorSubject<TokensNetworkState>(
    TOKENS_PAGINATION
  );

  public get tokensNetworkState(): TokensNetworkState {
    return this._tokensNetworkState$.value;
  }

  public needRefetchTokens: boolean;

  private readonly _storageTokensState$ = new BehaviorSubject<{
    tokens: Omit<Token, 'price'>[]; // todo move
    loaded: boolean;
  }>({
    tokens: undefined,
    loaded: false
  });

  private get storageTokens(): Omit<Token, 'price'>[] {
    return this._storageTokensState$.getValue().tokens;
  }

  private get userAddress(): string | undefined {
    return this.authService.userAddress;
  }

  constructor(
    private readonly tokensApiService: TokensApiService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly storeService: StoreService
  ) {
    this.getStorageTokens();

    this.setupSubscriptions();
  }

  public getStorageTokens(): void {
    const storageTokens = this.storeService.getItem('tokens');
    if (storageTokens.length) {
      this._storageTokensState$.next({ tokens: storageTokens, loaded: false });

      this.authService.currentUser$
        .pipe(first(user => Boolean(user) || user === null))
        .subscribe(async () => {
          const tokensList = List(storageTokens.map(token => ({ ...token, price: 0 })));
          const tokensWithBalance = await this.calculateTokensBalancesByType('default', tokensList);
          this._tokens$.next(List(this.patchTokensBalances(tokensWithBalance)));

          this._storageTokensState$.next({ tokens: storageTokens, loaded: true });
        });
    } else {
      this._storageTokensState$.next({ tokens: [], loaded: true });
    }
  }

  /**
   * Setups service subscriptions.
   */
  private setupSubscriptions(): void {
    this._tokensRequestParameters$
      .pipe(
        switchMap(params => {
          return this.tokensApiService.getTokensList(params, this._tokensNetworkState$);
        }),
        switchMap(backendTokens => {
          this.updateStorageTokens(backendTokens);

          const newAddedTokens = backendTokens.filter(
            token => !this.storageTokens.some(localToken => compareTokens(localToken, token))
          );
          return forkJoin([
            this._storageTokensState$.pipe(first(({ loaded }) => loaded)),
            this.calculateTokensBalancesByType('default', newAddedTokens)
          ]).pipe(
            tap(([_, tokensWithBalance]) => {
              const patchedTokens = this.patchTokensBalances(tokensWithBalance).map(
                currentToken => {
                  const backendToken = backendTokens.find(bT => compareTokens(bT, currentToken));
                  if (!backendToken) {
                    return currentToken;
                  }
                  return {
                    ...currentToken,
                    ...backendToken
                  };
                }
              );
              this._tokens$.next(patchedTokens);
            })
          );
        })
      )
      .subscribe(() => {
        this.needRefetchTokens = this.tokensApiService.needRefetchTokens;
      });
    this._tokensRequestParameters$.next(undefined);

    this.authService.currentUser$
      .pipe(
        switchMap(async user => {
          if (this.tokens) {
            return await this.calculateTokensBalancesByType('default');
          }
          if (user?.address) {
            const favoriteTokens = await this.tokensApiService.fetchFavoriteTokens();
            return this.calculateTokensBalancesByType('favorite', favoriteTokens);
          } else {
            return [];
          }
        })
      )
      .subscribe(favoriteTokens => {
        this._favoriteTokens$.next(List(favoriteTokens));
      });
  }

  private updateStorageTokens(tokens: List<Token>): void {
    const storageTokens = this.storageTokens;
    const updatedTokens = tokens
      .map(token => ({
        blockchain: token.blockchain,
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        image: token.image,
        rank: token.rank
      }))
      .toArray();

    const shouldUpdateList = updatedTokens.some(updatedToken => {
      const foundLocalToken = storageTokens.find(localToken =>
        compareTokens(updatedToken, localToken)
      );
      return !foundLocalToken || !compareObjects(updatedToken, foundLocalToken);
    });
    if (shouldUpdateList) {
      this.storeService.setItem('tokens', updatedTokens);
    }
  }

  private patchTokensBalances(tokensWithBalance: TokenAmount[]): List<TokenAmount> {
    return (this.tokens || List([]))
      .map(token => {
        const foundToken = tokensWithBalance?.find(tokenWithBalance =>
          areTokensEqual(token, tokenWithBalance)
        );
        if (!foundToken) {
          return token;
        } else {
          return {
            ...token,
            ...foundToken
          };
        }
      })
      .concat(
        tokensWithBalance.filter(
          tokenWithBalance => !this.tokens?.find(token => areTokensEqual(token, tokenWithBalance))
        )
      );
  }

  /**
   * Sets default tokens params.
   * @param tokens Tokens list.
   * @param isFavorite Is tokens list favorite.
   */
  private setDefaultTokensParams(tokens: List<Token>, isFavorite: boolean): List<TokenAmount> {
    return tokens.map(token => ({
      ...token,
      amount: new BigNumber(NaN),
      favorite: isFavorite
    }));
  }

  /**
   * Calculates balance for default or favorite tokens list.
   * @param type Type of tokens list: default or favorite.
   * @param oldTokens Token list to calculate.
   */
  private async calculateTokensBalancesByType(
    type: 'favorite' | 'default',
    oldTokens?: List<TokenAmount | Token>
  ): Promise<TokenAmount[]> {
    const subject$ = type === 'favorite' ? this._favoriteTokens$ : this._tokens$;
    const tokens = oldTokens || subject$.value;

    if (!tokens) {
      return [];
    }
    if (type === 'default') {
      if (!this.userAddress) {
        return this.setDefaultTokensParams(tokens, false).toArray();
      }
    } else if (!this.userAddress) {
      return [];
    }

    const newTokens = this.setDefaultTokensParams(tokens, type === 'favorite');
    return this.getTokensWithBalance(newTokens as List<TokenAmount>);
  }

  /**
   * Get balance for each token in list.
   * @param tokens List of tokens.
   * @param tokenBlockchain Token balance.
   * @return Promise<TokenAmount[]> Tokens with balance.
   */
  private async getTokensWithBalance(
    tokens: List<TokenAmount>,
    tokenBlockchain?: BlockchainName
  ): Promise<TokenAmount[]> {
    try {
      const blockchains = this.walletConnectorService.getBlockchainsBasedOnWallet();
      if (
        !this.authService.user ||
        (tokenBlockchain ? !blockchains.includes(tokenBlockchain) : false)
      ) {
        return tokens.toArray();
      }

      const tokensWithBlockchain: { [p: string]: TokenAmount[] } = Object.fromEntries(
        blockchains.map(blockchain => [blockchain, []])
      );
      tokens.forEach(tokenAmount =>
        tokensWithBlockchain?.[tokenAmount?.blockchain]?.push(tokenAmount)
      );

      const balances$: Observable<BigNumber[]>[] = blockchains.map(blockchain => {
        const tokensAddresses = tokensWithBlockchain[blockchain].map(el => el.address);

        const publicAdapter = Injector.web3PublicService.getWeb3Public(
          blockchain as EvmBlockchainName
        );
        return from(publicAdapter.getTokensBalances(this.userAddress, tokensAddresses)).pipe(
          timeout(3000),
          catchError(() => of([]))
        );
      });

      const balancesSettled = await Promise.all(balances$.map(el$ => firstValueFrom(el$)));

      return blockchains
        .map((blockchain, blockchainIndex) => {
          const balances = balancesSettled[blockchainIndex];
          return tokens
            .filter(token => token.blockchain === blockchain)
            .map((token, tokenIndex) => ({
              ...token,
              amount: Web3Pure.fromWei(balances?.[tokenIndex] || 0, token.decimals) || undefined
            }))
            .toArray();
        })
        .filter(t => t !== null)
        .flat();
    } catch (err: unknown) {
      console.debug(err);
      return [];
    }
  }

  /**
   * Adds token to tokens list.
   * @param address Tokens address.
   * @param blockchain Tokens blockchain.
   * @return Observable<TokenAmount> Tokens with balance.
   */
  public addTokenByAddress(address: string, blockchain: BlockchainName): Observable<TokenAmount> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
      blockchain as EvmBlockchainName
    );
    const chainType = BlockchainsInfo.getChainType(blockchain);
    const balance$ =
      this.userAddress && this.authService.userChainType === chainType
        ? from(blockchainAdapter.getTokenBalance(this.userAddress, address))
        : of(null);
    const token$ = SdkToken.createToken({ blockchain, address });

    return forkJoin([token$, balance$]).pipe(
      map(([token, amount]) => ({
        blockchain,
        address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        image: '',
        rank: 1,
        price: null,
        amount: amount || new BigNumber(NaN)
      })),
      tap((token: TokenAmount) => this._tokens$.next(this.tokens.push(token)))
    );
  }

  /**
   * Adds new token to tokens list.
   * @param token Tokens to add.
   */
  public addToken(token: TokenAmount): void {
    if (!this.tokens.find(t => areTokensEqual(t, token))) {
      this._tokens$.next(this.tokens.push(token));
    }
  }

  /**
   * Patches token in tokens list.
   * @param token Token to patch.
   */
  public patchToken(token: TokenAmount): void {
    this._tokens$.next(this.tokens.filter(t => !areTokensEqual(t, token)).push(token));
  }

  /**
   * Gets token by address.
   * @param token Tokens's data to find it by.
   * @param searchBackend If true and token was not retrieved, then request to backend with token's params is sent.
   */
  public async findToken(token: MinimalToken, searchBackend = false): Promise<TokenAmount> {
    const foundToken = this.tokens.find(t => areTokensEqual(t, token));
    if (foundToken) {
      return foundToken;
    }

    if (searchBackend) {
      return firstValueFrom(
        this.fetchQueryTokens(token.address, token.blockchain).pipe(
          map(backendTokens => backendTokens.get(0))
        )
      );
    }

    return null;
  }

  /**
   * Updates pagination state for current network.
   * @param blockchain Blockchain name.
   */
  private updateNetworkPage(blockchain: BlockchainName): void {
    const oldState = this._tokensNetworkState$.value;
    const newState = {
      ...oldState,
      [blockchain]: {
        ...oldState[blockchain],
        page: oldState[blockchain].page + 1
      }
    };
    this._tokensNetworkState$.next(newState);
  }

  /**
   * Fetches tokens for specific network.
   * @param blockchain Requested network.
   * @param updateCallback Callback after tokens fetching.
   */
  public fetchNetworkTokens(blockchain: BlockchainName, updateCallback?: () => void): void {
    const page = Math.max(2, this._tokensNetworkState$.value[blockchain].page + 1);
    forkJoin([
      this._tokensNetworkState$.pipe(first(state => state[blockchain].page >= 1)),
      this.tokensApiService.fetchSpecificBackendTokens({
        network: blockchain,
        page
      })
    ])
      .pipe(
        map(([_, tokensResponse]) => tokensResponse),
        tap(() => this.updateNetworkPage(blockchain)),
        map(tokensResponse => ({
          ...tokensResponse,
          result: tokensResponse.result.map(token => ({
            ...token,
            amount: new BigNumber(NaN),
            favorite: false
          }))
        })),
        switchMap(tokens => {
          return this.userAddress
            ? from(this.getTokensWithBalance(tokens.result)).pipe(
                catchError(() => []),
                map(tokensWithBalance =>
                  tokensWithBalance?.length ? tokensWithBalance : tokens.result.toArray()
                )
              )
            : of(tokens.result.toArray());
        }),
        finalize(() => {
          updateCallback?.();
        })
      )
      .subscribe((tokens: TokenAmount[]) => {
        this._tokens$.next(this.tokens.concat(tokens));
      });
  }

  /**
   * Fetches tokens from backend by search query string.
   * @param query Search query.
   * @param blockchain Tokens blockchain.
   */
  public fetchQueryTokens(
    query: string,
    blockchain: BlockchainName
  ): Observable<List<TokenAmount>> {
    query = query.toLowerCase();
    const isAddress = query.length >= 42;

    const isLifiTokens = !TO_BACKEND_BLOCKCHAINS[blockchain];
    if (isLifiTokens) {
      return of(
        this.tokens.filter(
          token =>
            token.blockchain === blockchain &&
            ((isAddress && compareAddresses(token.address, query)) ||
              (!isAddress &&
                (token.name.toLowerCase().includes(query) ||
                  token.symbol.toLowerCase().includes(query))))
        )
      );
    }

    const params: TokensRequestQueryOptions = {
      network: blockchain,
      ...(!isAddress && { symbol: query }),
      ...(isAddress && { address: query })
    };

    return this.tokensApiService.fetchQueryTokens(params).pipe(
      switchMap(async backendTokens => {
        return List(
          await this.getTokensWithBalance(
            this.setDefaultTokensParams(backendTokens, false),
            blockchain
          )
        );
      })
    );
  }

  /**
   * Adds token to list of favorite tokens.
   * @param favoriteToken Favorite token to add.
   */
  public addFavoriteToken(favoriteToken: TokenAmount): Observable<unknown> {
    return this.tokensApiService.addFavoriteToken(favoriteToken).pipe(
      switchMap(() => {
        return from(
          Injector.web3PublicService
            .getWeb3Public(favoriteToken.blockchain as Web3PublicSupportedBlockchain)
            .getBalance(this.walletConnectorService.address, favoriteToken.address)
        );
      }),
      tap((favoriteTokenBalance: BigNumber) => {
        const tokenBalance = Web3Pure.fromWei(favoriteTokenBalance, favoriteToken.decimals);
        if (!this._favoriteTokens$.value.some(token => compareTokens(token, favoriteToken))) {
          this._favoriteTokens$.next(
            this._favoriteTokens$.value.push({ ...favoriteToken, amount: tokenBalance })
          );
        }
      })
    );
  }

  /**
   * Removes token from list of favorite tokens.
   * @param token Favorite token to remove.
   */
  public removeFavoriteToken(token: TokenAmount): Observable<unknown> {
    const filteredTokens = this._favoriteTokens$.value.filter(el => !areTokensEqual(el, token));
    return this.tokensApiService.deleteFavoriteToken(token).pipe(
      tap(() => {
        if (
          this._favoriteTokens$.value.some(favoriteToken => compareTokens(token, favoriteToken))
        ) {
          this._favoriteTokens$.next(filteredTokens);
        }
      })
    );
  }
}
