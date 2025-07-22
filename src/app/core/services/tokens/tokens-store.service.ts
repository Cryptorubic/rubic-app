import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, forkJoin, from, Observable, of } from 'rxjs';
import { List } from 'immutable';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { map, switchMap, tap } from 'rxjs/operators';
import { TokensApiService } from '@core/services/backend/tokens-api/tokens-api.service';
import { AuthService } from '@core/services/auth/auth.service';
import { Token } from '@shared/models/tokens/token';
import BigNumber from 'bignumber.js';
import { BlockchainName, BlockchainsInfo, EvmBlockchainName, Injector, Web3Pure } from 'rubic-sdk';
import { Token as SdkToken } from 'rubic-sdk/lib/common/tokens/token';
import { compareObjects, compareTokens } from '@shared/utils/utils';
import { StoreService } from '@core/services/store/store.service';
import { StorageToken } from '@core/services/tokens/models/storage-token';
import { AssetType } from '@app/features/trade/models/asset';
import { TokensUpdaterService } from '@app/core/services/tokens/tokens-updater.service';
import { BalanceLoaderService } from './balance-loader.service';
import { BalanceLoadingStateService } from './balance-loading-state.service';
import { AssetsSelectorStateService } from '@app/features/trade/components/assets-selector/services/assets-selector-state/assets-selector-state.service';
import { AllChainsTokensLists } from './models/all-chains-tokens';
import { BalancePatcherFacade } from './utils/balance-patcher-facade';
import {
  TOKEN_FILTERS,
  TokenFilter
} from '@app/features/trade/components/assets-selector/models/token-filters';
import { TokenAmountWithPriceChange } from '@app/shared/models/tokens/available-token-amount';
import { TokenConvertersService } from './token-converters.service';

@Injectable({
  providedIn: 'root'
})
export class TokensStoreService {
  /**
   * Common tokens list state for selectors of specific blockchain.
   */
  private readonly _tokens$ = new BehaviorSubject<List<TokenAmount>>(List());

  public readonly tokens$: Observable<List<TokenAmount>> = this._tokens$.asObservable();

  private readonly _allChainsTokens$ = new BehaviorSubject<AllChainsTokensLists>({
    ALL_CHAINS_ALL_TOKENS: List(),
    ALL_CHAINS_GAINERS: List(),
    ALL_CHAINS_LOSERS: List(),
    ALL_CHAINS_TRENDING: List()
  });

  private readonly _lastQueriedTokens$ = new BehaviorSubject<List<TokenAmount>>(List());

  public updateLastQueriedTokensState(queryTokens: List<TokenAmount>): void {
    this._lastQueriedTokens$.next(queryTokens);
  }

  public updateAllChainsTokensState(tokens: List<TokenAmount>, tokenFilter: TokenFilter): void {
    this._allChainsTokens$.next({ ...this.allChainsTokens, [tokenFilter]: tokens });
  }

  public updateCommonTokensState(tokens: List<TokenAmount>): void {
    this._tokens$.next(tokens);
  }

  /**
   * Current tokens list.
   */
  public get tokens(): List<TokenAmount> {
    return this._tokens$.getValue();
  }

  public get allChainsTokens(): AllChainsTokensLists {
    return this._allChainsTokens$.getValue();
  }

  public get lastQueriedTokens(): List<TokenAmount> {
    return this._lastQueriedTokens$.value;
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

  private storageTokens: StorageToken[];

  private get userAddress(): string | undefined {
    return this.authService.userAddress;
  }

  private readonly balancePatcherFacade: BalancePatcherFacade;

  constructor(
    private readonly tokensApiService: TokensApiService,
    private readonly authService: AuthService,
    private readonly storeService: StoreService,
    private readonly tokensUpdaterService: TokensUpdaterService,
    private readonly balanceLoaderService: BalanceLoaderService,
    private readonly balanceLoadingStateService: BalanceLoadingStateService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly tokenConverters: TokenConvertersService
  ) {
    this.balancePatcherFacade = new BalancePatcherFacade(
      this,
      assetsSelectorStateService,
      tokenConverters
    );

    this.setupStorageTokens();
    this.setupTokensForAllChainsTab();
    this.setupSubscriptions();
  }

  private setupStorageTokens(): void {
    this.storageTokens = this.storeService.getItem('RUBIC_TOKENS') || [];
    if (this.storageTokens.length) {
      const tokens = this.tokenConverters.getTokensWithNullBalances(
        List(this.storageTokens.map(token => ({ ...token, price: 0 }))),
        false
      );
      this.updateCommonTokensState(tokens);
    }
  }

  private async setupTokensForAllChainsTab(): Promise<void> {
    this.tokensUpdaterService.setTokensLoading(true);
    // firstly load tokens without balances for ALL_CHAINS_ALL_TOKENS, TRENDING, GAINERS, LOSERS
    const [allTokens, trendingTokens, gainersTokens, losersTokens] = await Promise.all([
      firstValueFrom(this.tokensApiService.fetchTokensListForAllChains()).then(val =>
        this.tokenConverters.getTokensWithNullBalances(val, false)
      ),
      firstValueFrom(this.tokensApiService.fetchTrendTokens()).then(val =>
        this.tokenConverters.getTokensWithNullBalances(val, false)
      ),
      firstValueFrom(this.tokensApiService.fetchGainersTokens()).then(val =>
        this.tokenConverters.getTokensWithNullBalances(val, false)
      ),
      firstValueFrom(this.tokensApiService.fetchLosersTokens()).then(val =>
        this.tokenConverters.getTokensWithNullBalances(val, false)
      )
    ]);

    this._allChainsTokens$.next({
      ALL_CHAINS_ALL_TOKENS: allTokens,
      ALL_CHAINS_TRENDING: trendingTokens as List<TokenAmountWithPriceChange>,
      ALL_CHAINS_GAINERS: gainersTokens as List<TokenAmountWithPriceChange>,
      ALL_CHAINS_LOSERS: losersTokens as List<TokenAmountWithPriceChange>
    });

    // load balances at first loading for allchains
    if (this.userAddress) {
      this.startBalanceCalculating('allChains', {
        allChainsFilterToPatch: TOKEN_FILTERS.ALL_CHAINS_ALL_TOKENS
      });
    }

    this.tokensUpdaterService.setTokensLoading(false);
    this.tokensUpdaterService.triggerUpdateTokens();
  }

  private setupSubscriptions(): void {
    this.authService.currentUser$
      .pipe(
        // @ts-ignore
        switchMap(user => {
          if (user?.address) {
            return this.tokensApiService.fetchFavoriteTokens();
          }
          return [];
        }),
        switchMap((favoriteTokens: Token[]) => this.getFavoriteTokensWithBalances(favoriteTokens))
      )
      .subscribe(favoriteTokens => {
        this._favoriteTokens$.next(List(favoriteTokens));
      });
  }

  private async getFavoriteTokensWithBalances(favoriteTokens: Token[]): Promise<TokenAmount[]> {
    const uniqueBlockchains = [...new Set(favoriteTokens.map(t => t.blockchain))];
    return (
      await Promise.all(
        uniqueBlockchains.map(async blockchain => {
          const favoriteTokensByBlockchain = favoriteTokens.filter(
            fT => fT.blockchain === blockchain
          );
          const favoriteTokensWithoutBalances = this.tokenConverters.getTokensWithNullBalances(
            List(favoriteTokensByBlockchain),
            true
          );

          return (
            await this.balanceLoaderService.getTokensWithBalance(favoriteTokensWithoutBalances)
          ).toArray();
        })
      )
    ).flat();
  }

  public async startBalanceCalculating(
    assetType: AssetType,
    options: { allChainsFilterToPatch?: TokenFilter } = {}
  ): Promise<void> {
    const isBalanceForSelectedAssetCalculated = this.balanceLoadingStateService.isBalanceCalculated(
      {
        assetType,
        tokenFilter: options.allChainsFilterToPatch || this.assetsSelectorStateService.tokenFilter
      }
    );

    if (isBalanceForSelectedAssetCalculated) return;

    if (!this.authService.userAddress) {
      this.balancePatcherFacade.patchNullBalancesCommonTokensList();
      this.balancePatcherFacade.patchNullBalancesEveryFilterListAllChains();
      this.tokensUpdaterService.triggerUpdateTokens();
      return;
    }

    let tokensList: List<TokenAmount> = List();
    if (options.allChainsFilterToPatch) {
      tokensList = this.allChainsTokens[options.allChainsFilterToPatch];
    } else if (assetType === 'allChains') {
      tokensList = this.allChainsTokens[this.assetsSelectorStateService.tokenFilter];
    } else {
      tokensList = this.tokens.filter(t => t.blockchain === assetType);
    }

    if (assetType === 'allChains') {
      // @TODO HERE
      // const onChainLoaded = (tokensWithBalances: List<TokenAmount>) => {
      //   this.balancePatcherFacade.patchDefaultTokensBalances(tokensWithBalances, {
      //     tokenListToPatch: 'allChainsTokens',
      //     allChainsFilterToPatch: options.allChainsFilterToPatch
      //   });
      //   this.tokensUpdaterService.triggerUpdateTokens();
      // };
      // // patches all tokens from allchains to common list to show them also in chains selectors
      // const onFinish = (allChainsTokensWithBalances: List<TokenAmount>): void => {
      //   this.balancePatcherFacade.addNewTokensToList(allChainsTokensWithBalances, {
      //     tokenListToPatch: 'commonTokens'
      //   });
      //   this.tokensUpdaterService.triggerUpdateTokens();
      // };
      // this.balanceLoaderService.updateBalancesForAllChains(tokensList, {
      //   onChainLoaded,
      //   onFinish,
      //   ...('allChainsFilterToPatch' in options && {
      //     allChainsFilterToPatch: options.allChainsFilterToPatch
      //   })
      // });
    } else {
      const onChainLoaded = (tokensWithBalances: List<TokenAmount>) => {
        this.balancePatcherFacade.patchDefaultTokensBalances(tokensWithBalances, {
          tokenListToPatch: 'commonTokens'
        });
        this.tokensUpdaterService.triggerUpdateTokens();
      };
      this.balanceLoaderService.updateBalancesForSpecificChain(
        tokensList,
        assetType,
        onChainLoaded
      );
    }
  }

  public updateStorageTokens(tokens: List<Token>): void {
    const updatedTokens: StorageToken[] = tokens
      .map(token => ({
        blockchain: token.blockchain,
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        image: token.image,
        rank: token.rank,
        tokenSecurity: token.tokenSecurity,
        type: token.type
      }))
      .toArray();

    const storageTokensMap = this.tokenConverters.convertTokensListToMap(List(this.storageTokens));
    const shouldUpdateList = updatedTokens.some(updatedToken => {
      const foundStorageToken = storageTokensMap.get(
        this.tokenConverters.getTokenKeyInMap(updatedToken)
      );
      return !foundStorageToken || !compareObjects(updatedToken, foundStorageToken);
    });

    if (shouldUpdateList) {
      this.storeService.setItem('RUBIC_TOKENS', updatedTokens);
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
        price: null as number | null,
        amount: amount || new BigNumber(NaN)
      })),
      tap((token: TokenAmount) => {
        const tokens = this.tokens.push(token);
        this.updateCommonTokensState(tokens);
      })
    );
  }

  /**
   * Adds new token to tokens list.
   * @param token Tokens to add.
   */
  public addToken(token: TokenAmount): void {
    if (!this.tokens.find(t => compareTokens(t, token))) {
      const tokens = this.tokens.push(token);
      this.updateCommonTokensState(tokens);
    }
  }

  /**
   * Adds token to list of favorite tokens.
   * @param favoriteToken Favorite token to add.
   */
  public addFavoriteToken(favoriteToken: TokenAmount): Observable<unknown> {
    return this.tokensApiService.addFavoriteToken(favoriteToken).pipe(
      tap((_avoriteTokenBalance: BigNumber) => {
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
    const filteredTokens = this._favoriteTokens$.value.filter(el => !compareTokens(el, token));
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
   * Find native token from storage with price by blockchain
   */
  public getNativeToken(blockchain: BlockchainName): Token {
    const chainType = BlockchainsInfo.getChainType(blockchain);
    const address = Web3Pure[chainType].nativeTokenAddress;

    return this.tokens.find(t => compareTokens(t, { address, blockchain }));
  }
}
