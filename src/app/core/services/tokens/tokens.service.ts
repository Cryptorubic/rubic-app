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
import { BlockchainPublicService } from 'src/app/core/services/blockchain/blockchain-public/blockchain-public.service';
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
import { LocalToken } from 'src/app/shared/models/tokens/local-token';
import { Web3EthSupportedBlockchains } from 'src/app/core/services/blockchain/blockchain-public/types';

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
  public readonly favoriteTokensSubject: BehaviorSubject<LocalToken[]>;

  /**
   * Current tokens request options state.
   */
  private readonly tokensRequestParametersSubject: Subject<{ [p: string]: unknown }>;

  /**
   * Current tokens network state.
   */
  private readonly tokensNetworkStateSubject: BehaviorSubject<TokensNetworkState>;

  /**
   * Tokens list as observable.
   */
  get tokens$(): Observable<List<TokenAmount>> {
    return this.tokensSubject.asObservable();
  }

  /**
   * Current tokens list.
   */
  get tokens(): List<TokenAmount> {
    return this.tokensSubject.getValue();
  }

  /**
   * Get current tokens list.
   */
  get favoriteTokens$(): Observable<LocalToken[]> {
    return this.favoriteTokensSubject.asObservable();
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

  /**
   * Amount of test tokens.
   */
  private readonly testTokensNumber: number;

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

  public get tokensNetworkState(): Observable<TokensNetworkState> {
    return this.tokensNetworkStateSubject.asObservable();
  }

  constructor(
    private readonly tokensApiService: TokensApiService,
    private readonly authService: AuthService,
    private readonly blockchainPublicService: BlockchainPublicService,
    private readonly useTestingMode: UseTestingModeService,
    private readonly coingeckoApiService: CoingeckoApiService,
    private readonly store: StoreService
  ) {
    this.tokensSubject = new BehaviorSubject(List([]));
    this.favoriteTokensSubject = new BehaviorSubject(this.fetchFavoriteTokens());
    this.tokensRequestParametersSubject = new Subject<{ [p: string]: unknown }>();
    this.tokensNetworkStateSubject = new BehaviorSubject<TokensNetworkState>(TOKENS_PAGINATION);

    this.testTokensNumber = coingeckoTestTokens.length;

    this.setupSubscriptions();
  }

  /**
   * Setups service subscriptions.
   */
  private setupSubscriptions(): void {
    this.tokensRequestParametersSubject
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
    });

    this.useTestingMode.isTestingMode.subscribe(async isTestingMode => {
      if (isTestingMode) {
        this.isTestingMode = true;
        this.tokensSubject.next(List(coingeckoTestTokens));
        await this.calculateUserTokensBalances();
      }
    });

    this.tokensRequestParametersSubject.next();
  }

  /**
   * Sets default tokens params.
   * @param tokens Tokens list.
   */
  private setDefaultTokensParams(tokens: List<Token> = this.tokens): void {
    this.tokensSubject.next(
      tokens.map(token => ({
        ...token,
        amount: new BigNumber(NaN),
        favorite: false
      }))
    );
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
      this.tokensSubject.next(List(updatedTokens));
    }
  }

  /**
   * Get balance for each token in list.
   * @param tokens List of tokens.
   * @return Promise<TokenAmount[]> Tokens with balance.
   */
  private async getTokensWithBalance(tokens: List<TokenAmount>): Promise<TokenAmount[]> {
    const blockchains: BLOCKCHAIN_NAME[] = [
      BLOCKCHAIN_NAME.ETHEREUM,
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      BLOCKCHAIN_NAME.POLYGON,
      BLOCKCHAIN_NAME.HARMONY,
      BLOCKCHAIN_NAME.AVALANCHE
    ];
    const balances$: Promise<BigNumber[]>[] = blockchains.map(
      (blockchain: Web3EthSupportedBlockchains) => {
        const tokensAddresses = tokens
          .filter(token => token.blockchain === blockchain)
          .map(token => token.address)
          .toArray();

        return this.blockchainPublicService.adapters[blockchain].getTokensBalances(
          this.userAddress,
          tokensAddresses
        );
      }
    );

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
              amount:
                BlockchainPublicService.fromWei(balances[tokenIndex], token.decimals) || undefined
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
  public addToken(address: string, blockchain: BLOCKCHAIN_NAME): Observable<TokenAmount> {
    const blockchainPublicAdapter = this.blockchainPublicService.adapters[blockchain];
    const balance$: Observable<BigNumber> = this.userAddress
      ? from(blockchainPublicAdapter.getTokenBalance(this.userAddress, address))
      : of(null);

    return forkJoin([blockchainPublicAdapter.getTokenInfo(address), balance$]).pipe(
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
      tap((token: TokenAmount) => this.tokensSubject.next(this.tokens.push(token)))
    );
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
      .getNativeCoinPriceInUsdByCoingecko(blockchain)
      .pipe(map(price => price || nativeCoin?.price))
      .toPromise();
  }

  /**
   * Updates token's price and emits new tokens' list with updated token.
   * @param token Token to update.
   */
  public updateTokenPriceInUsd(token: TokenAmount): void {
    this.coingeckoApiService.getTokenPrice(token).subscribe(tokenPrice => {
      if (tokenPrice) {
        const foundToken = this.tokens.find(t => TokensService.areTokensEqual(t, token));
        const newToken = {
          ...token,
          ...foundToken,
          price: tokenPrice || token.price
        };
        this.tokensSubject.next(
          this.tokens
            .filter(tokenAmount => !TokensService.areTokensEqual(tokenAmount, token))
            .push(newToken)
        );
      }
    });
  }

  /**
   * Updates pagination state for current network.
   * @param network Blockchain name.
   * @param next Have next page or not.
   */
  private updateNetworkPage(network: PAGINATED_BLOCKCHAIN_NAME, next: string): void {
    const oldState = this.tokensNetworkStateSubject.value;
    const newState = {
      ...oldState,
      [network]: {
        ...oldState[network],
        page: oldState[network].page + 1,
        maxPage: next ? oldState[network].maxPage + 1 : oldState[network].maxPage
      }
    } as TokensNetworkState;
    this.tokensNetworkStateSubject.next(newState);
  }

  /**
   * Fetches tokens for specific network.
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
        tap((tokens: { total: number; result: List<TokenAmount>; next: string }) =>
          this.updateNetworkPage(network, tokens.next)
        ),
        switchMap((tokens: { total: number; result: List<TokenAmount> }) => {
          return this.userAddress ? this.getTokensWithBalance(tokens.result) : of(tokens.result);
        })
      )
      .subscribe((tokens: TokenAmount[]) => {
        this.tokensSubject.next(this.tokens.concat(tokens));
        callback();
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
    const params = {
      network: TO_BACKEND_BLOCKCHAINS[network],
      ...(!isAddress && { symbol: query }),
      ...(isAddress && { address: query })
    } as TokensRequestOptions;
    return this.tokensApiService.fetchQueryToken(params);
  }

  /**
   * Adds token to list of favorite tokens.
   * @param favoriteToken Favorite token to add.
   */
  public addFavoriteToken(favoriteToken: TokenAmount): void {
    const localToken: LocalToken = {
      address: favoriteToken.address,
      blockchain: favoriteToken.blockchain
    };
    const collection = [...this.favoriteTokensSubject.value, localToken];
    this.store.setItem('favoriteTokens', collection);
    this.favoriteTokensSubject.next(collection);
  }

  /**
   * Removes token from list of favorite tokens.
   * @param token Favorite token to remove.
   */
  public removeFavoriteToken(token: TokenAmount): void {
    const filteredTokens = this.favoriteTokensSubject.value.filter(
      el => !TokensService.areTokensEqual(el, token)
    );

    this.store.setItem('favoriteTokens', filteredTokens);
    this.favoriteTokensSubject.next(filteredTokens);
  }

  /**
   * Fetches favorite tokens from local storage.
   */
  private fetchFavoriteTokens(): LocalToken[] {
    return this.store.getItem('favoriteTokens') || [];
  }
}
