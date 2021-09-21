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
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { map, switchMap, tap } from 'rxjs/operators';
import { CoingeckoApiService } from 'src/app/core/services/external-api/coingecko-api/coingecko-api.service';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { TOKENS_PAGINATION } from 'src/app/core/services/tokens/tokens-pagination.constant';
import {
  DEFAULT_PAGE_SIZE,
  TokensRequestOptions
} from 'src/app/core/services/backend/tokens-api/models/tokens';
import { TO_BACKEND_BLOCKCHAINS } from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import {
  PAGINATED_BLOCKCHAIN_NAME,
  TokensNetworkState
} from 'src/app/shared/models/tokens/paginated-tokens';
import { StoreService } from 'src/app/core/services/store/store.service';

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
  private readonly tokensSubject: BehaviorSubject<List<TokenAmount>>;

  /**
   * Current favorite tokens list state.
   */
  public readonly favoriteTokensSubject: BehaviorSubject<List<TokenAmount>>;

  /**
   * Current tokens request options state.
   */
  private readonly tokensRequestParametersSubject: Subject<{ [p: string]: unknown }>;

  /**
   * Current tokens network state.
   */
  private readonly tokensNetworkStateSubject: BehaviorSubject<TokensNetworkState>;

  /**
   * Get current tokens list.
   */
  public get tokens(): Observable<List<TokenAmount>> {
    return this.tokensSubject
      .asObservable()
      .pipe(map(list => list.filter(token => token !== null)));
  }

  /**
   * Get current tokens list.
   */
  public get favoriteTokens$(): Observable<List<TokenAmount>> {
    return this.favoriteTokensSubject
      .asObservable()
      .pipe(map(list => list.filter(token => token !== null)));
  }

  /**
   * Set current tokens request options.
   */
  set tokensRequestParameters(parameters: { [p: string]: unknown }) {
    this.tokensRequestParametersSubject.next(parameters);
  }

  /**
   * Current user address.
   */
  private userAddress: string;

  /**
   * Is testing mode currently activated.
   */
  private isTestingMode = false;

  public get tokensNetworkState(): Observable<TokensNetworkState> {
    return this.tokensNetworkStateSubject.asObservable();
  }

  constructor(
    private readonly tokensApiService: TokensApiService,
    private readonly authService: AuthService,
    private readonly web3PublicService: Web3PublicService,
    private readonly useTestingMode: UseTestingModeService,
    private readonly coingeckoApiService: CoingeckoApiService,
    private readonly store: StoreService
  ) {
    this.tokensSubject = new BehaviorSubject(List([]));
    this.favoriteTokensSubject = new BehaviorSubject(List(this.fetchFavoriteTokens()));
    this.tokensRequestParametersSubject = new Subject<{ [p: string]: unknown }>();
    this.tokensNetworkStateSubject = new BehaviorSubject<TokensNetworkState>(TOKENS_PAGINATION);

    this.setupSubscriptions();
  }

  /**
   * Set favorite tokens list.
   * @param tokens Favorite tokens list.
   */
  public setFavoriteTokens(tokens: List<TokenAmount>): void {
    this.favoriteTokensSubject.next(tokens);
  }

  /**
   * Setup service subscriptions.
   */
  private setupSubscriptions(): void {
    this.tokensRequestParametersSubject
      .pipe(switchMap(params => this.tokensApiService.getTokensList(params)))
      .subscribe(
        async tokens => {
          if (!this.isTestingMode) {
            this.setDefaultTokenAmounts(tokens);
            await this.calculateUserTokensBalances();
          }
        },
        err => console.error('Error retrieving tokens', err)
      );

    this.authService.getCurrentUser().subscribe(async user => {
      this.userAddress = user?.address;
      await this.calculateUserTokensBalances();
      await this.calculateFavoriteTokensBalances();
    });

    this.useTestingMode.isTestingMode.subscribe(async isTestingMode => {
      if (isTestingMode) {
        this.isTestingMode = true;
        this.tokensSubject.next(List(coingeckoTestTokens));
        await this.calculateUserTokensBalances();
        await this.calculateFavoriteTokensBalances();
      }
    });

    this.tokensRequestParametersSubject.next();
  }

  /**
   * @description Set new tokens.
   * @param tokens Tokens list to set.
   */
  public setTokens(tokens: List<TokenAmount>): void {
    this.tokensSubject.next(tokens);
  }

  /**
   * Set default tokens.
   * @param tokens Default tokens list.
   */
  private setDefaultTokenAmounts(tokens: List<Token> = this.tokensSubject.getValue()): void {
    this.tokensSubject.next(
      tokens.map(token => ({
        ...token,
        amount: new BigNumber(NaN),
        favorite: false
      }))
    );
  }

  /**
   * Calculate balance for token list.
   * @param tokens Token list.
   */
  public async calculateUserTokensBalances(
    tokens: List<TokenAmount> = this.tokensSubject.getValue()
  ): Promise<void> {
    if (!tokens.size) {
      return;
    }

    if (!this.userAddress) {
      this.setDefaultTokenAmounts(tokens);
      return;
    }

    const tokensWithBalance = await this.getTokensWithBalance(tokens);

    if (!this.isTestingMode || (this.isTestingMode && tokens.size < 1000)) {
      this.tokensSubject.next(List(tokensWithBalance));
    }
  }

  /**
   * Calculate balance for token list.
   * @param favoriteTokens Favorite tokens list.
   */
  public async calculateFavoriteTokensBalances(
    favoriteTokens: List<TokenAmount> = this.favoriteTokensSubject.getValue()
  ): Promise<void> {
    if (!favoriteTokens.size || favoriteTokens.find(el => el === null)) {
      return;
    }

    if (!this.userAddress) {
      this.tokensSubject.next(
        favoriteTokens.map(token => ({
          ...token,
          amount: new BigNumber(0),
          favorite: false
        }))
      );
      return;
    }

    const tokensWithBalance = await this.getTokensWithBalance(favoriteTokens);

    if (!this.isTestingMode || (this.isTestingMode && favoriteTokens.size < 1000)) {
      this.favoriteTokensSubject.next(List(tokensWithBalance));
    }
  }

  /**
   * @description Get balance for each token in list.
   * @param tokens List of tokens.
   * @return Promise<TokenAmount[]> Tokens with balance.
   */
  private async getTokensWithBalance(tokens: List<TokenAmount>): Promise<TokenAmount[]> {
    const blockchains: BLOCKCHAIN_NAME[] = [
      BLOCKCHAIN_NAME.ETHEREUM,
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      BLOCKCHAIN_NAME.POLYGON,
      BLOCKCHAIN_NAME.HARMONY
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
      .flat();
  }

  /**
   * Add token to tokens list.
   * @param address Token address.
   * @param blockchain Token blockchain.
   * @return Observable<TokenAmount> Token with balance.
   */
  public addToken(address: string, blockchain: BLOCKCHAIN_NAME): Observable<TokenAmount> {
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
        amount
      })),
      tap((token: TokenAmount) =>
        this.tokensSubject.next(this.tokensSubject.getValue().push(token))
      )
    );
  }

  /**
   * Get native coin price in USD.
   * @param blockchain Token blockchain.
   * @return Promise<number> USD amount.
   */
  public async getNativeCoinPriceInUsd(blockchain: BLOCKCHAIN_NAME): Promise<number> {
    const nativeCoin = this.tokensSubject
      .getValue()
      .find(token => token.blockchain === blockchain && token.address === NATIVE_TOKEN_ADDRESS);
    return this.coingeckoApiService.getNativeCoinPriceInUsdByCoingecko(
      blockchain,
      nativeCoin?.price
    );
  }

  /**
   * Update pagination state for current network.
   * @param network Blockchain name.
   */
  private updateNetworkPage(network: PAGINATED_BLOCKCHAIN_NAME): void {
    const oldState = this.tokensNetworkStateSubject.value;
    const newState = {
      ...oldState,
      [network]: {
        ...oldState[network],
        page: oldState[network].page + 1
      }
    } as TokensNetworkState;
    this.tokensNetworkStateSubject.next(newState);
  }

  /**
   * Fetch tokens for specific network.
   * @param network Requested network.
   * @param pageSize Requested page size.
   * @param callback Callback after success fetch.
   */
  public fetchNetworkTokens(
    network: PAGINATED_BLOCKCHAIN_NAME,
    pageSize: number = DEFAULT_PAGE_SIZE,
    callback?: () => void
  ): void {
    this.tokensApiService
      .fetchSpecificBackendTokens({
        network,
        page: this.tokensNetworkStateSubject.value[network].page,
        pageSize
      })
      .pipe(
        map((tokens: { total: number; result: List<Token> }) => ({
          ...tokens,
          result: tokens.result.map(token => ({ ...token, amount: new BigNumber(NaN) }))
        })),
        tap(() => this.updateNetworkPage(network)),
        switchMap((tokens: { total: number; result: List<TokenAmount> }) => {
          return this.userAddress ? this.getTokensWithBalance(tokens.result) : of(tokens.result);
        })
      )
      .subscribe((tokens: TokenAmount[]) => {
        this.tokensSubject.next(this.tokensSubject.value.concat(tokens));
        callback();
      });
  }

  /**
   * Fetch tokens from backend by search query string.
   * @param query Search query.
   * @param network Tokens network.
   */
  public fetchQueryTokens(
    query: string,
    network: PAGINATED_BLOCKCHAIN_NAME
  ): Observable<List<Token>> {
    const isAddress = query.includes('0x');
    const params = {
      network: TO_BACKEND_BLOCKCHAINS[network],
      ...(!isAddress && { symbol: query }),
      ...(isAddress && { address: query })
    } as TokensRequestOptions;
    return this.tokensApiService.fetchQueryToken(params);
  }

  /**
   * @description Add token to list of favorite tokens.
   * @param favoriteToken Favorite token to add.
   */
  public addFavoriteToken(favoriteToken: TokenAmount): void {
    const collection = this.favoriteTokensSubject.value.concat(favoriteToken);
    this.store.setItem('favoriteTokens', collection.toArray());
    this.favoriteTokensSubject.next(collection);
  }

  /**
   * Remove token from list of favorite tokens.
   * @param token Favorite token to remove.
   */
  public removeFavoriteToken(token: TokenAmount): void {
    const filteredTokens = this.favoriteTokensSubject.value.filter(el => {
      return (
        (el.blockchain === token.blockchain && el.address !== token.address) ||
        el.blockchain !== token.blockchain
      );
    });

    this.store.setItem('favoriteTokens', filteredTokens.toArray());
    this.favoriteTokensSubject.next(filteredTokens);
  }

  /**
   * Fetch favorite tokens from local storage.
   */
  private fetchFavoriteTokens(): TokenAmount[] {
    return this.store.getItem('favoriteTokens');
  }
}
