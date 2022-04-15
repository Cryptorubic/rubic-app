import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, from, Observable, of, Subject } from 'rxjs';
import { List } from 'immutable';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TokensApiService } from 'src/app/core/services/backend/tokens-api/tokens-api.service';
import { BlockchainName, NEAR_BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { Token } from '@shared/models/tokens/token';
import BigNumber from 'bignumber.js';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { catchError, map, switchMap, tap, timeout } from 'rxjs/operators';
import { CoingeckoApiService } from 'src/app/core/services/external-api/coingecko-api/coingecko-api.service';
import {
  NATIVE_TOKEN_ADDRESS,
  NATIVE_SOLANA_MINT_ADDRESS,
  NATIVE_NEAR_ADDRESS
} from '@shared/constants/blockchain/native-token-address';
import { TOKENS_PAGINATION } from '@core/services/tokens/tokens-pagination';
import { TokensRequestQueryOptions } from 'src/app/core/services/backend/tokens-api/models/tokens';
import { TokensNetworkState } from 'src/app/shared/models/tokens/paginated-tokens';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { compareAddresses, compareTokens } from '@shared/utils/utils';
import { ErrorsService } from '@core/errors/errors.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { MinimalToken } from '@shared/models/tokens/minimal-token';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';

/**
 * Service that contains actions (transformations and fetch) with tokens.
 */
@Injectable({
  providedIn: 'root'
})
export class TokensService {
  /**
   * Current tokens list state.
   */
  private readonly _tokens$ = new BehaviorSubject<List<TokenAmount>>(undefined);

  public readonly tokens$ = this._tokens$.asObservable();

  /**
   * Current favorite tokens list state.
   */
  // eslint-disable-next-line rxjs/no-exposed-subjects
  public readonly _favoriteTokens$ = new BehaviorSubject<List<TokenAmount>>(List());

  public readonly favoriteTokens$ = this._favoriteTokens$.asObservable();

  /**
   * Current tokens request options state.
   */
  private readonly _tokensRequestParameters$ = new Subject<{ [p: string]: unknown }>();

  /**
   * Current tokens network state.
   */
  private readonly _tokensNetworkState$ = new BehaviorSubject<TokensNetworkState>(
    TOKENS_PAGINATION
  );

  public readonly tokensNetworkState$ = this._tokensNetworkState$.asObservable();

  /**
   * Current user address.
   */
  private userAddress: string;

  /**
   * Current tokens list.
   */
  get tokens(): List<TokenAmount> {
    return this._tokens$.getValue();
  }

  /**
   * Current favorite tokens list.
   */
  get favoriteTokens(): List<TokenAmount> {
    return this._favoriteTokens$.getValue();
  }

  /**
   * Sets new tokens request options.
   */
  set tokensRequestParameters(parameters: { [p: string]: unknown }) {
    this._tokensRequestParameters$.next(parameters);
  }

  /**
   * Checks if two tokens are equal.
   */
  public static areTokensEqual(
    token0: { blockchain: BlockchainName; address: string },
    token1: { blockchain: BlockchainName; address: string }
  ): boolean {
    return (
      token0?.blockchain === token1?.blockchain &&
      token0?.address?.toLowerCase() === token1?.address?.toLowerCase()
    );
  }

  constructor(
    private readonly tokensApiService: TokensApiService,
    private readonly authService: AuthService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly coingeckoApiService: CoingeckoApiService,
    private readonly errorsService: ErrorsService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    this.setupSubscriptions();
  }

  /**
   * Setups service subscriptions.
   */
  private setupSubscriptions(): void {
    this._tokensRequestParameters$
      .pipe(
        switchMap(params => this.tokensApiService.getTokensList(params, this._tokensNetworkState$)),
        switchMap(tokens => {
          const newTokens = this.setDefaultTokensParams(tokens, false);
          return this.calculateTokensBalancesByType('default', newTokens);
        }),
        catchError((err: unknown) => {
          console.error('Error retrieving tokens', err);
          return of();
        })
      )
      .subscribe();

    this.authService.getCurrentUser().subscribe(async user => {
      this.userAddress = user?.address;
      await this.calculateTokensBalancesByType('default');
      if (this.userAddress) {
        this.fetchFavoriteTokens();
      } else {
        this._favoriteTokens$.next(List([]));
      }
    });

    this._tokensRequestParameters$.next(undefined);
  }

  public fetchFavoriteTokens(): void {
    this.tokensApiService
      .fetchFavoriteTokens()
      .subscribe(tokens => this.calculateTokensBalancesByType('favorite', tokens));
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
   * Calculates tokens balances for default and favorite tokens.
   */
  public async calculateTokensBalances(): Promise<void> {
    await this.calculateTokensBalancesByType('default');
    await this.calculateTokensBalancesByType('favorite');
  }

  /**
   * Calculates balance for favorite tokens list.
   * @param type Type of tokens list: default or favorite.
   * @param oldTokens Favorite tokens list.
   */
  public async calculateTokensBalancesByType(
    type: 'favorite' | 'default',
    oldTokens?: List<TokenAmount | Token>
  ): Promise<void> {
    const subject$ = type === 'favorite' ? this._favoriteTokens$ : this._tokens$;
    const tokens = oldTokens || subject$.value;

    if (type === 'default') {
      if (!tokens) {
        return;
      }
      if (!this.userAddress) {
        this._tokens$.next(this.setDefaultTokensParams(tokens, false));
        return;
      }
    } else if (!tokens || !this.userAddress) {
      this._favoriteTokens$.next(List([]));
      return;
    }

    const newTokens = this.setDefaultTokensParams(tokens, type === 'favorite');
    const tokensWithBalance = await this.getTokensWithBalance(newTokens as List<TokenAmount>);

    const updatedTokens = tokens.map(token => {
      const currentToken = this.tokens?.find(t => TokensService.areTokensEqual(token, t));
      const balance = tokensWithBalance.find(tWithBalance =>
        TokensService.areTokensEqual(token, tWithBalance)
      )?.amount;
      return {
        ...token,
        ...currentToken,
        amount: balance || new BigNumber(NaN)
      };
    });
    subject$.next(List(updatedTokens));
  }

  /**
   * Get balance for each token in list.
   * @param tokens List of tokens.
   * @return Promise<TokenAmount[]> Tokens with balance.
   */
  private async getTokensWithBalance(tokens: List<TokenAmount>): Promise<TokenAmount[]> {
    try {
      const blockchains = this.walletConnectorService.getBlockchainsBasedOnWallet();

      const tokensWithBlockchain: { [p: string]: TokenAmount[] } = Object.fromEntries(
        blockchains.map(blockchain => [blockchain, []])
      );
      tokens.forEach(tokenAmount =>
        tokensWithBlockchain?.[tokenAmount?.blockchain]?.push(tokenAmount)
      );

      const balances$: Observable<BigNumber[]>[] = blockchains.map(blockchain => {
        const tokensAddresses = tokensWithBlockchain[blockchain].map(el => el.address);

        return from(
          this.publicBlockchainAdapterService[blockchain].getTokensBalances(
            this.userAddress,
            tokensAddresses
          )
        ).pipe(
          timeout(3000),
          catchError(() => [])
        );
      });

      const balancesSettled = await Promise.all(balances$.map(el$ => el$.toPromise()));

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
    }
  }

  /**
   * Adds token to tokens list.
   * @param address Tokens address.
   * @param blockchain Tokens blockchain.
   * @return Observable<TokenAmount> Tokens with balance.
   */
  public addTokenByAddress(address: string, blockchain: BlockchainName): Observable<TokenAmount> {
    const blockchainAdapter = this.publicBlockchainAdapterService[blockchain];
    const balance$: Observable<BigNumber> = this.userAddress
      ? from(blockchainAdapter.getTokenBalance(this.userAddress, address))
      : of(null);

    return forkJoin([blockchainAdapter.getTokenInfo(address), balance$]).pipe(
      map(([tokenInfo, amount]) => ({
        blockchain,
        address,
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        image: '',
        rank: 1,
        price: null,
        usedInIframe: true,
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
    if (!this.tokens.find(t => TokensService.areTokensEqual(t, token))) {
      this._tokens$.next(this.tokens.push(token));
    }
  }

  /**
   * Patches token in tokens list.
   * @param token Tokens to patch.
   */
  public patchToken(token: TokenAmount): void {
    this._tokens$.next(
      this.tokens.filter(t => !TokensService.areTokensEqual(t, token)).push(token)
    );
  }

  /**
   * Sets default image to token, in case original image has thrown error.
   * Patches tokens list, if {@param token} is passed.
   * @param $event Img error event.
   * @param token If passed, then tokens list will be patched.
   */
  public onTokenImageError($event: Event, token: TokenAmount = null): void {
    const target = $event.target as HTMLImageElement;
    if (target.src !== DEFAULT_TOKEN_IMAGE) {
      target.src = DEFAULT_TOKEN_IMAGE;

      if (token) {
        const newToken = {
          ...token,
          image: DEFAULT_TOKEN_IMAGE
        };
        this.patchToken(newToken);
      }
    }
  }

  /**
   * Gets price of native token.
   * @param blockchain Blockchain of native token.
   */
  public getNativeCoinPriceInUsd(blockchain: BlockchainName): Promise<number> {
    let nativeCoinAddress: string;
    const blockchainType = BlockchainsInfo.getBlockchainType(blockchain);
    if (blockchainType === 'solana') {
      nativeCoinAddress = NATIVE_SOLANA_MINT_ADDRESS;
    } else if (blockchainType === 'ethLike') {
      nativeCoinAddress = NATIVE_TOKEN_ADDRESS;
    } else if (blockchainType === 'near') {
      nativeCoinAddress = NATIVE_NEAR_ADDRESS;
    }

    const nativeCoin = this.tokens.find(token =>
      TokensService.areTokensEqual(token, { blockchain, address: nativeCoinAddress })
    );
    return this.coingeckoApiService
      .getNativeCoinPrice(blockchain)
      .pipe(map(price => price || nativeCoin?.price))
      .toPromise();
  }

  /**
   * Gets token's price and updates tokens list.
   * @param token Tokens to get price for.
   * @param searchBackend If true and token's price was not retrieved, then request to backend with token's params is sent.
   */
  public getAndUpdateTokenPrice(
    token: {
      address: string;
      blockchain: BlockchainName;
    },
    searchBackend = false
  ): Promise<number | undefined> {
    return this.coingeckoApiService
      .getCommonTokenOrNativeCoinPrice(token)
      .pipe(
        map(tokenPrice => {
          if (tokenPrice) {
            return tokenPrice;
          }
          const foundToken = this.tokens.find(t => TokensService.areTokensEqual(t, token));
          return foundToken?.price;
        }),
        switchMap(tokenPrice => {
          if (!tokenPrice && searchBackend) {
            return this.fetchQueryTokens(token.address, token.blockchain).pipe(
              map(backendTokens => backendTokens.get(0)?.price)
            );
          }
          return of(tokenPrice);
        }),
        tap(tokenPrice => {
          if (tokenPrice) {
            const foundToken = this.tokens.find(t => TokensService.areTokensEqual(t, token));
            if (foundToken && tokenPrice !== foundToken.price) {
              const newToken = {
                ...foundToken,
                price: tokenPrice
              };
              this._tokens$.next(
                this.tokens
                  .filter(tokenAmount => !TokensService.areTokensEqual(tokenAmount, token))
                  .push(newToken)
              );
            }
          }
        })
      )
      .toPromise();
  }

  /**
   * Gets token's balance and updates tokens list.
   * @param token Tokens to get balance for.
   */
  public async getAndUpdateTokenBalance(token: {
    address: string;
    blockchain: BlockchainName;
  }): Promise<BigNumber> {
    if (!this.userAddress) {
      return null;
    }

    try {
      const blockchainAdapter = this.publicBlockchainAdapterService[token.blockchain];
      const balanceInWei = await blockchainAdapter.getTokenOrNativeBalance(
        this.userAddress,
        token.address
      );

      const foundToken = this.tokens.find(t => TokensService.areTokensEqual(t, token));
      if (!foundToken) {
        return new BigNumber(NaN);
      }
      const balance = Web3Pure.fromWei(balanceInWei, foundToken.decimals);
      if (!foundToken.amount.eq(balance)) {
        const newToken = {
          ...foundToken,
          amount: balance
        };
        this._tokens$.next(
          this.tokens
            .filter(tokenAmount => !TokensService.areTokensEqual(tokenAmount, token))
            .push(newToken)
        );
      }
      return new BigNumber(balance);
    } catch (err) {
      console.debug(err);
      const foundToken = this.tokens.find(t => TokensService.areTokensEqual(t, token));
      return foundToken?.amount;
    }
  }

  public async updateNativeTokenBalance(blockchain: BlockchainName): Promise<void> {
    const web3Public = this.publicBlockchainAdapterService[blockchain];
    await this.getAndUpdateTokenBalance({
      address: web3Public.nativeTokenAddress,
      blockchain
    });
  }

  public async updateTokenBalanceAfterSwap(token: {
    address: string;
    blockchain: BlockchainName;
  }): Promise<void> {
    const web3Public = this.publicBlockchainAdapterService[token.blockchain];
    if (web3Public.isNativeAddress(token.address)) {
      await this.getAndUpdateTokenBalance(token);
    } else {
      await Promise.all([
        this.getAndUpdateTokenBalance(token),
        this.getAndUpdateTokenBalance({
          address: web3Public.nativeTokenAddress,
          blockchain: token.blockchain
        })
      ]);
    }
  }

  /**
   * Gets token by address.
   * @param token Tokens's data to find it by.
   * @param searchBackend If true and token was not retrieved, then request to backend with token's params is sent.
   */
  public async getTokenByAddress(token: MinimalToken, searchBackend = true): Promise<Token> {
    const foundToken = this.tokens.find(t => TokensService.areTokensEqual(t, token));
    if (foundToken) {
      return foundToken;
    }

    if (searchBackend) {
      return this.fetchQueryTokens(token.address, token.blockchain)
        .pipe(map(backendTokens => backendTokens.get(0)))
        .toPromise();
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
   */
  public fetchNetworkTokens(blockchain: BlockchainName): void {
    this.tokensApiService
      .fetchSpecificBackendTokens({
        network: blockchain,
        page: this._tokensNetworkState$.value[blockchain].page
      })
      .pipe(
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
  public fetchQueryTokens(query: string, blockchain: BlockchainName): Observable<List<Token>> {
    const isAddress = query.length >= 42;

    if (blockchain === NEAR_BLOCKCHAIN_NAME) {
      const fetchQueryTokensByAddress$ = this.tokensApiService.fetchQueryTokens({
        network: blockchain,
        address: query
      });
      const fetchQueryTokensBySymbol$ = this.tokensApiService.fetchQueryTokens({
        network: blockchain,
        symbol: query
      });

      return forkJoin([fetchQueryTokensByAddress$, fetchQueryTokensBySymbol$]).pipe(
        map(([foundTokensByAddress, foundTokensBySymbol]) => {
          return foundTokensByAddress.size > 0 ? foundTokensByAddress : foundTokensBySymbol;
        })
      );
    }

    const params: TokensRequestQueryOptions = {
      network: blockchain,
      ...(!isAddress && { symbol: query }),
      ...(isAddress && { address: query })
    };

    return this.tokensApiService.fetchQueryTokens(params);
  }

  /**
   * Adds token to list of favorite tokens.
   * @param favoriteToken Favorite token to add.
   */
  public addFavoriteToken(favoriteToken: TokenAmount): Observable<unknown> {
    return this.tokensApiService.addFavoriteToken(favoriteToken).pipe(
      tap(() => {
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
  public removeFavoriteToken(token: TokenAmount): Observable<unknown> {
    const filteredTokens = this._favoriteTokens$.value.filter(
      el => !TokensService.areTokensEqual(el, token)
    );
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

  /**
   * Gets symbol of token, using currently stored tokens or blockchain request.
   */
  public async getTokenSymbol(blockchain: BlockchainName, tokenAddress: string): Promise<string> {
    const foundToken = this.tokens.find(
      token => token.blockchain === blockchain && compareAddresses(token.address, tokenAddress)
    );
    if (foundToken) {
      return foundToken?.symbol;
    }

    const blockchainAdapter = this.publicBlockchainAdapterService.getEthLikeWeb3Public(blockchain);
    return blockchainAdapter.getTokenSymbol(tokenAddress);
  }
}
