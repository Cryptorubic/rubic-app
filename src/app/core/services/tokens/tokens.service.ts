import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, from, Observable, of, Subject } from 'rxjs';
import { List } from 'immutable';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { coingeckoTestTokens } from 'src/test/tokens/test-tokens';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { TokensApiService } from 'src/app/core/services/backend/tokens-api/tokens-api.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Token } from 'src/app/shared/models/tokens/Token';
import BigNumber from 'bignumber.js';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3/web3-public-service/web3-public.service';
import { Web3Public } from 'src/app/core/services/blockchain/web3/web3-public-service/Web3Public';
import { map, switchMap, tap } from 'rxjs/operators';
import { CoingeckoApiService } from 'src/app/core/services/external-api/coingecko-api/coingecko-api.service';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { TOKENS_PAGINATION } from 'src/app/core/services/tokens/tokens-pagination.constant';
import { TokensRequestQueryOptions } from 'src/app/core/services/backend/tokens-api/models/tokens';
import {
  PAGINATED_BLOCKCHAIN_NAME,
  TokensNetworkState
} from 'src/app/shared/models/tokens/paginated-tokens';
import { DEFAULT_TOKEN_IMAGE } from 'src/app/shared/constants/tokens/DEFAULT_TOKEN_IMAGE';
import { compareAddresses } from '@shared/utils/utils';
import { ErrorsService } from '@core/errors/errors.service';
import { WalletError } from '@core/errors/models/provider/WalletError';

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
  private readonly _tokens$ = new BehaviorSubject<List<TokenAmount>>(List([]));

  public readonly tokens$ = this._tokens$.asObservable();

  /**
   * Current favorite tokens list state.
   */
  public readonly _favoriteTokens$ = new BehaviorSubject<List<TokenAmount>>(List([]));

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

  public readonly tokensNetworkState = this._tokensNetworkState$.asObservable();

  /**
   * Current user address.
   */
  private userAddress: string;

  /**
   * Is testing mode currently activated.
   */
  private isTestingMode = false;

  /**
   * Amount of test tokens.
   */
  private readonly testTokensNumber: number;

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
    token0: { blockchain: BLOCKCHAIN_NAME; address: string },
    token1: { blockchain: BLOCKCHAIN_NAME; address: string }
  ): boolean {
    return (
      token0?.blockchain === token1?.blockchain &&
      token0?.address.toLowerCase() === token1?.address.toLowerCase()
    );
  }

  constructor(
    private readonly tokensApiService: TokensApiService,
    private readonly authService: AuthService,
    private readonly web3PublicService: Web3PublicService,
    private readonly useTestingMode: UseTestingModeService,
    private readonly coingeckoApiService: CoingeckoApiService,
    private readonly errorsService: ErrorsService
  ) {
    this.testTokensNumber = coingeckoTestTokens.length;

    this.setupSubscriptions();
  }

  /**
   * Setups service subscriptions.
   */
  private setupSubscriptions(): void {
    this._tokensRequestParameters$
      .pipe(switchMap(params => this.tokensApiService.getTokensList(params)))
      .subscribe(
        async tokens => {
          if (!this.isTestingMode) {
            this.setDefaultTokensParams(tokens);
            await this.calculateUserTokensBalances();
          }
        },
        err => console.error('Error retrieving tokens', err)
      );

    this.authService.getCurrentUser().subscribe(async user => {
      this.userAddress = user?.address;
      await this.calculateUserTokensBalances();
      if (this.userAddress) {
        this.fetchFavoriteTokens();
      } else {
        this._favoriteTokens$.next(List([]));
      }
    });

    this.useTestingMode.isTestingMode.subscribe(async isTestingMode => {
      if (isTestingMode) {
        this.isTestingMode = true;
        this._tokens$.next(List(coingeckoTestTokens));
        await this.calculateUserTokensBalances();
      }
    });

    this._tokensRequestParameters$.next();
  }

  public fetchFavoriteTokens(): void {
    this.tokensApiService
      .fetchFavoriteTokens()
      .subscribe(async tokens => this.calculateFavoriteTokensBalances(tokens));
  }

  /**
   * Sets default tokens params.
   * @param tokens Tokens list.
   */
  private setDefaultTokensParams(tokens: List<Token> = this.tokens): void {
    this._tokens$.next(
      tokens.map(token => ({
        ...token,
        amount: new BigNumber(NaN),
        favorite: false
      }))
    );
  }

  /**
   * Calculates balance for favorite token list.
   * @param tokensWithoutBalance Favorite token list.
   */
  public async calculateFavoriteTokensBalances(
    tokensWithoutBalance: List<TokenAmount | Token> = this.favoriteTokens
  ): Promise<void> {
    if (!tokensWithoutBalance.size || !this.userAddress) {
      this._favoriteTokens$.next(List([]));
      return;
    }

    const tokens = tokensWithoutBalance.map(token => ({
      ...token,
      amount: new BigNumber(NaN),
      favorite: true
    }));

    const tokensWithBalance = await this.getTokensWithBalance(tokens);

    if (!this.isTestingMode || (this.isTestingMode && tokens.size <= this.testTokensNumber)) {
      const updatedTokens = tokens.map(token => {
        const currentToken = this.tokens.find(t => TokensService.areTokensEqual(token, t));
        const balance = tokensWithBalance.find(tWithBalance =>
          TokensService.areTokensEqual(token, tWithBalance)
        )?.amount;
        return {
          ...token,
          ...currentToken,
          amount: balance
        };
      });
      this._favoriteTokens$.next(List(updatedTokens));
    }
  }

  /**
   * Calculates balance for token list.
   * @param tokens Token list.
   */
  public async calculateUserTokensBalances(tokens: List<TokenAmount> = this.tokens): Promise<void> {
    if (!tokens.size) {
      return;
    }

    if (!this.userAddress) {
      this.setDefaultTokensParams(tokens);
      return;
    }

    const tokensWithBalance = await this.getTokensWithBalance(tokens);

    if (!this.isTestingMode || (this.isTestingMode && tokens.size <= this.testTokensNumber)) {
      const updatedTokens = tokens.map(token => {
        const currentToken = this.tokens.find(t => TokensService.areTokensEqual(token, t));
        const balance = tokensWithBalance.find(tWithBalance =>
          TokensService.areTokensEqual(token, tWithBalance)
        )?.amount;
        return {
          ...token,
          ...currentToken,
          amount: balance
        };
      });
      this._tokens$.next(List(updatedTokens));
    }
  }

  /**
   * Get balance for each token in list.
   * @param tokens List of tokens.
   * @return Promise<TokenAmount[]> Tokens with balance.
   */
  public async getTokensWithBalance(tokens: List<TokenAmount>): Promise<TokenAmount[]> {
    const blockchains: BLOCKCHAIN_NAME[] = [
      BLOCKCHAIN_NAME.ETHEREUM,
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      BLOCKCHAIN_NAME.POLYGON,
      BLOCKCHAIN_NAME.HARMONY,
      BLOCKCHAIN_NAME.AVALANCHE,
      BLOCKCHAIN_NAME.MOONRIVER
    ];
    const balances$: Promise<BigNumber[]>[] = blockchains.map(blockchain => {
      const tokensAddresses = tokens
        .filter(token => token.blockchain === blockchain)
        .map(token => token.address)
        .toArray();

      return this.web3PublicService[blockchain].getTokensBalances(
        this.userAddress,
        tokensAddresses
      );
    });

    const balancesSettled = await Promise.allSettled(balances$);

    return blockchains
      .map((blockchain, blockchainIndex) => {
        if (balancesSettled[blockchainIndex].status === 'fulfilled') {
          const balances = (balancesSettled[blockchainIndex] as PromiseFulfilledResult<BigNumber[]>)
            .value;
          return tokens
            .filter(token => token.blockchain === blockchain)
            .map((token, tokenIndex) => ({
              ...token,
              amount: Web3Public.fromWei(balances[tokenIndex], token.decimals) || undefined
            }))
            .toArray();
        }
        return null;
      })
      .filter(t => t !== null)
      .flat();
  }

  /**
   * Adds token to tokens list.
   * @param address Token address.
   * @param blockchain Token blockchain.
   * @return Observable<TokenAmount> Token with balance.
   */
  public addTokenByAddress(address: string, blockchain: BLOCKCHAIN_NAME): Observable<TokenAmount> {
    const web3Public: Web3Public = this.web3PublicService[blockchain];
    const balance$: Observable<BigNumber> = this.userAddress
      ? from(web3Public.getTokenBalance(this.userAddress, address))
      : of(null);

    return forkJoin([web3Public.getTokenInfo(address), balance$]).pipe(
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
   * @param token Token to add.
   */
  public addToken(token: TokenAmount): void {
    if (!this.tokens.find(t => TokensService.areTokensEqual(t, token))) {
      this._tokens$.next(this.tokens.push(token));
    }
  }

  /**
   * Patches token in tokens list.
   * @param token Token to patch.
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
  public getNativeCoinPriceInUsd(blockchain: BLOCKCHAIN_NAME): Promise<number> {
    const nativeCoin = this.tokens.find(token =>
      TokensService.areTokensEqual(token, { blockchain, address: NATIVE_TOKEN_ADDRESS })
    );
    return this.coingeckoApiService
      .getNativeCoinPrice(blockchain)
      .pipe(map(price => price || nativeCoin?.price))
      .toPromise();
  }

  /**
   * Gets token's price and updates tokens list.
   * @param token Token to get price for.
   * @param searchBackend If true and token's price was not retrieved, then request to backend with token's params is sent.
   */
  public getAndUpdateTokenPrice(
    token: {
      address: string;
      blockchain: BLOCKCHAIN_NAME;
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
            return this.fetchQueryTokens(
              token.address,
              token.blockchain as PAGINATED_BLOCKCHAIN_NAME
            ).pipe(map(backendTokens => backendTokens.get(0)?.price));
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
   * @param token Token to get balance for.
   */
  public async getAndUpdateTokenBalance(token: {
    address: string;
    blockchain: BLOCKCHAIN_NAME;
  }): Promise<BigNumber> {
    if (!this.userAddress) {
      return null;
    }

    try {
      const web3Public = this.web3PublicService[token.blockchain];
      const balanceInWei = await web3Public.getTokenOrNativeBalance(
        this.userAddress,
        token.address
      );

      const foundToken = this.tokens.find(t => TokensService.areTokensEqual(t, token));
      if (!foundToken) {
        return new BigNumber(NaN);
      }
      const balance = Web3Public.fromWei(balanceInWei, foundToken.decimals);
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

  /**
   * Updates pagination state for current network.
   * @param network Blockchain name.
   * @param next Have next page or not.
   */
  private updateNetworkPage(network: PAGINATED_BLOCKCHAIN_NAME, next: string): void {
    const oldState = this._tokensNetworkState$.value;
    const newState = {
      ...oldState,
      [network]: {
        ...oldState[network],
        page: oldState[network].page + 1,
        maxPage: next ? oldState[network].maxPage + 1 : oldState[network].maxPage
      }
    };
    this._tokensNetworkState$.next(newState);
  }

  /**
   * Fetches tokens for specific network.
   * @param network Requested network.
   */
  public fetchNetworkTokens(network: PAGINATED_BLOCKCHAIN_NAME): void {
    this.tokensApiService
      .fetchSpecificBackendTokens({
        network,
        page: this._tokensNetworkState$.value[network].page
      })
      .pipe(
        tap(tokensResponse => this.updateNetworkPage(network, tokensResponse.next)),
        map(tokensResponse => ({
          ...tokensResponse,
          result: tokensResponse.result.map(token => ({
            ...token,
            amount: new BigNumber(NaN),
            favorite: false
          }))
        })),
        switchMap(tokens => {
          return this.userAddress ? this.getTokensWithBalance(tokens.result) : of(tokens.result);
        })
      )
      .subscribe((tokens: TokenAmount[]) => {
        this._tokens$.next(this.tokens.concat(tokens));
      });
  }

  /**
   * Fetches tokens from backend by search query string.
   * @param query Search query.
   * @param network Tokens network.
   */
  public fetchQueryTokens(
    query: string,
    network: PAGINATED_BLOCKCHAIN_NAME
  ): Observable<List<Token>> {
    const isAddress = query.includes('0x');
    const params: TokensRequestQueryOptions = {
      network,
      ...(!isAddress && { symbol: query }),
      ...(isAddress && { address: query })
    };
    return this.tokensApiService.fetchQueryTokens(params);
  }

  /**
   * Adds token to list of favorite tokens.
   * @param favoriteToken Favorite token to add.
   */
  public addFavoriteToken(favoriteToken: TokenAmount): void {
    this.tokensApiService.addFavoriteToken(favoriteToken).subscribe(
      () => {
        this._favoriteTokens$.next(this._favoriteTokens$.value.push(favoriteToken));
      },
      () => {
        this.errorsService.catch(new WalletError());
      }
    );
  }

  /**
   * Removes token from list of favorite tokens.
   * @param token Favorite token to remove.
   */
  public removeFavoriteToken(token: TokenAmount): void {
    const filteredTokens = this._favoriteTokens$.value.filter(
      el => !TokensService.areTokensEqual(el, token)
    );

    this.tokensApiService.deleteFavoriteToken(token).subscribe(
      () => {
        this._favoriteTokens$.next(filteredTokens);
      },
      () => {
        this.errorsService.catch(new WalletError());
      }
    );
  }

  /**
   * Gets symbol of token, using currently stored tokens or web3 request.
   */
  public async getTokenSymbol(blockchain: BLOCKCHAIN_NAME, tokenAddress: string): Promise<string> {
    const foundToken = this.tokens.find(
      token => token.blockchain === blockchain && compareAddresses(token.address, tokenAddress)
    );
    if (foundToken) {
      return foundToken?.symbol;
    }
    const web3Public = this.web3PublicService[blockchain];
    return web3Public.getTokenSymbol(tokenAddress);
  }
}
