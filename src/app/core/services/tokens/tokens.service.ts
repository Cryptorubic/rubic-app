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
import { TokensRequestOptions } from 'src/app/core/services/backend/tokens-api/models/tokens';
import { TO_BACKEND_BLOCKCHAINS } from 'src/app/shared/constants/blockchain/BACKEND_BLOCKCHAINS';

export interface CountPage {
  count: number | undefined;
  page: number;
}

interface TokensNetworkState {
  [BLOCKCHAIN_NAME.ETHEREUM]: CountPage;
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: CountPage;
  [BLOCKCHAIN_NAME.POLYGON]: CountPage;
  [BLOCKCHAIN_NAME.HARMONY]: CountPage;
}

@Injectable({
  providedIn: 'root'
})
export class TokensService {
  /**
   * Current tokens list state.
   */
  private readonly tokensSubject: BehaviorSubject<List<TokenAmount>>;

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
  get tokens(): Observable<List<TokenAmount>> {
    return this.tokensSubject
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
    private readonly coingeckoApiService: CoingeckoApiService
  ) {
    this.tokensSubject = new BehaviorSubject(List([]));
    this.tokensRequestParametersSubject = new Subject<{ [p: string]: unknown }>();
    this.tokensNetworkStateSubject = new BehaviorSubject<TokensNetworkState>(TOKENS_PAGINATION);
    this.setupSubscriptions();
  }

  /**
   * @description Setup service subscriptions.
   * @todo Throw away subscriptions. It's not allow in services.
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
   * @description Set new tokens.
   */
  public setTokens(tokens: List<TokenAmount>): void {
    this.tokensSubject.next(tokens);
  }

  /**
   * @description Set default tokens.
   * @param tokens Default tokens list.
   */
  private setDefaultTokenAmounts(tokens: List<Token> = this.tokensSubject.getValue()): void {
    this.tokensSubject.next(
      tokens.map(token => ({
        ...token,
        amount: new BigNumber(NaN)
      }))
    );
  }

  /**
   * @description Calculate balance for token list.
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

    const blockchains: BLOCKCHAIN_NAME[] = [
      BLOCKCHAIN_NAME.ETHEREUM,
      BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      BLOCKCHAIN_NAME.POLYGON,
      BLOCKCHAIN_NAME.HARMONY
    ];
    const balances$ = blockchains.map(blockchain => {
      return this.web3PublicService[blockchain].getTokensBalances(
        this.userAddress,
        tokens
          .filter(token => token.blockchain === blockchain)
          .map(token => token.address)
          .toArray()
      );
    });

    const balancesSettled = await Promise.allSettled(balances$);
    const tokensWithBalance: TokenAmount[][] = blockchains.map((blockchain, blockchainIndex) => {
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
    });

    tokensWithBalance.push(
      tokens.filter(token => !blockchains.includes(token.blockchain)).toArray()
    );

    if (!this.isTestingMode || (this.isTestingMode && tokens.size < 1000)) {
      this.tokensSubject.next(List(tokensWithBalance.flat()));
    }
  }

  /**
   * @description Add token to tokens list.
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

  public isOnlyBalanceUpdated(prevToken: TokenAmount, nextToken: TokenAmount): boolean {
    if (!prevToken || !nextToken) {
      return false;
    }
    return (
      prevToken.blockchain === nextToken.blockchain &&
      prevToken.address.toLowerCase() === nextToken.address.toLowerCase()
    );
  }

  /**
   * @description get native coin price in USD.
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
   * @description Update pagination state for current network.
   * @param network Blockchain name.
   */
  private updateNetworkPage(network: BLOCKCHAIN_NAME): void {
    const oldState = this.tokensNetworkStateSubject.value;
    const newState = {
      ...oldState,
      [network]: {
        ...oldState[network],
        page: oldState[network].page + 1
      }
    };
    this.tokensNetworkStateSubject.next(newState);
  }

  /**
   * @description Fetch tokens for specific network.
   * @param network Requested network.
   * @param pageSize Requested page size.
   * @param callback Callback after success fetch.
   */
  public fetchNetworkTokens(
    network: BLOCKCHAIN_NAME,
    pageSize: number = 150,
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
        }))
      )
      .subscribe((tokens: { total: number; result: List<TokenAmount> }) => {
        this.updateNetworkPage(network);
        this.tokensSubject.next(this.tokensSubject.value.concat(tokens.result));
        callback();
      });
  }

  /**
   *
   * @param query
   * @param network
   */
  public fetchQueryTokens(query: string, network: BLOCKCHAIN_NAME): Observable<List<Token>> {
    const isAddress = query.includes('0x');
    const params = {
      network: TO_BACKEND_BLOCKCHAINS[network],
      ...(!isAddress && { symbol: query }),
      ...(isAddress && { address: query })
    } as TokensRequestOptions;
    return this.tokensApiService.fetchQueryToken(params);
  }
}
