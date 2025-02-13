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
import { TokenConvertersService } from './token-converters.service';

@Injectable({
  providedIn: 'root'
})
export class TokensStoreService {
  /**
   * Current tokens list state.
   */
  private readonly _tokens$ = new BehaviorSubject<List<TokenAmount>>(List());

  public readonly tokens$: Observable<List<TokenAmount>> = this._tokens$.asObservable();

  private readonly _allChainsTokens$ = new BehaviorSubject<List<TokenAmount>>(List());

  private readonly _lastQueriedTokens$ = new BehaviorSubject<List<TokenAmount>>(List());

  public updateLastQueriedTokens(queryTokens: List<TokenAmount>): void {
    this._lastQueriedTokens$.next(queryTokens);
  }

  /**
   * Tokens shown in seelctor when 'All Chains' selected
   */
  public readonly allChainsTokens$: Observable<List<TokenAmount>> =
    this._allChainsTokens$.asObservable();

  /**
   * Current tokens list.
   */
  public get tokens(): List<TokenAmount> {
    return this._tokens$.getValue();
  }

  public get allChainsTokens(): List<TokenAmount> {
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

  constructor(
    private readonly tokensApiService: TokensApiService,
    private readonly authService: AuthService,
    private readonly storeService: StoreService,
    private readonly tokensUpdaterService: TokensUpdaterService,
    private readonly balanceLoaderService: BalanceLoaderService,
    private readonly balanceLoadingStateService: BalanceLoadingStateService,
    private readonly tokenConverters: TokenConvertersService
  ) {
    this.setupStorageTokens();
    this.setupAllChainsTokensList();
    this.setupSubscriptions();
  }

  private setupStorageTokens(): void {
    this.storageTokens = this.storeService.getItem('RUBIC_TOKENS') || [];
    if (this.storageTokens.length) {
      const tokens = this.balanceLoaderService.getTokensWithNullBalances(
        List(this.storageTokens.map(token => ({ ...token, price: 0 }))),
        false
      );
      this._tokens$.next(tokens);
    }
  }

  private async setupAllChainsTokensList(): Promise<void> {
    // firstly load tokens without balances to make allChainsTokens not empty
    const tokensListForAllChainsFromBackend = await firstValueFrom(
      this.tokensApiService.fetchTokensListForAllChains()
    );
    const defaultTokensList = this.balanceLoaderService.getTokensWithNullBalances(
      tokensListForAllChainsFromBackend,
      false
    );
    this._allChainsTokens$.next(defaultTokensList);

    // load balances at first loading for allchains
    if (this.userAddress) {
      this.startBalanceCalculating('allChains');
    }
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
          const favoriteTokensWithoutBalances = this.balanceLoaderService.getTokensWithNullBalances(
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

  public async startBalanceCalculating(blockchain: AssetType): Promise<void> {
    if (!this.authService.userAddress) {
      const nullTokens = this.balanceLoaderService.getTokensWithNullBalances(this.tokens, false);
      const nullAllChainsTokens = this.balanceLoaderService.getTokensWithNullBalances(
        this.allChainsTokens,
        false
      );

      this.patchTokensBalances(nullTokens, false);
      this.patchTokensBalances(nullAllChainsTokens, true);
      this.tokensUpdaterService.triggerUpdateTokens();

      return;
    }

    if (this.balanceLoadingStateService.isBalanceCalculated(blockchain)) {
      return;
    }

    const tokensList =
      blockchain === 'allChains'
        ? this.allChainsTokens
        : this.tokens.filter(t => t.blockchain === blockchain);

    if (blockchain === 'allChains') {
      const onBalanceLoaded = (tokensWithBalances: List<TokenAmount>, patchAllChains: boolean) => {
        this.patchTokensBalances(tokensWithBalances, patchAllChains);
        this.tokensUpdaterService.triggerUpdateTokens();
      };
      // patches all tokens from allchains to common list to show them also in chains selectors
      const onFinish = (allChainsTokensWithBalances: List<TokenAmount>): void => {
        this.patchTokens(allChainsTokensWithBalances);
        this.tokensUpdaterService.triggerUpdateTokens();
      };
      this.balanceLoaderService.updateBalancesForAllChains(tokensList, onBalanceLoaded, onFinish);
    } else {
      const onFinish = (tokensWithBalances: List<TokenAmount>, userAddress: string | undefined) => {
        if (userAddress) {
          this.patchTokensBalances(tokensWithBalances);
          this.tokensUpdaterService.triggerUpdateTokens();
        }
      };
      this.balanceLoaderService.updateBalancesForSpecificChain(tokensList, blockchain, onFinish);
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

    const shouldUpdateList = updatedTokens.some(updatedToken => {
      const foundStorageToken = this.storageTokens?.find(localToken =>
        compareTokens(updatedToken, localToken)
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
        this._tokens$.next(tokens);
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
      this._tokens$.next(tokens);
    }
  }

  /**
   * Patches token in tokens list.
   * @param token Token to patch.
   */
  public patchToken(token: TokenAmount): void {
    const tokens = this.tokens.filter(t => !compareTokens(t, token)).push(token);
    this._tokens$.next(tokens);
  }

  /**
   * @description Method combines tokens from storage.get('RUBIC_TOKENS) with tokens from backend
   * and tokens from backend have high priority
   * @param newTokens tokens from backend
   */
  public patchTokens(newTokens: List<Token | TokenAmount>): void {
    const newTokensMap = this.tokenConverters.convertTokensListToMap(newTokens);
    const oldTokensMap = this.tokenConverters.convertTokensListToMap(this.tokens);

    const updatedTokens = this.tokens
      .map(token => {
        const tokenInPrevList = oldTokensMap.get(this.tokenConverters.getTokenKeyInMap(token));
        const tokenInNewList = newTokensMap.get(this.tokenConverters.getTokenKeyInMap(token));
        if (tokenInPrevList && tokenInNewList) {
          newTokensMap.delete(this.tokenConverters.getTokenKeyInMap(token));
          return { ...tokenInPrevList, ...tokenInNewList };
        } else {
          return tokenInPrevList;
        }
      })
      .concat(newTokensMap.values());

    this._tokens$.next(updatedTokens);
  }

  public patchTokensBalances(
    tokensWithBalances: List<TokenAmount>,
    patchAllChains: boolean = false
  ): void {
    const list: List<TokenAmount> = patchAllChains ? this.allChainsTokens : this.tokens;
    const _listSubj$ = patchAllChains ? this._allChainsTokens$ : this._tokens$;

    const tokensWithBalancesMap = this.tokenConverters.convertTokensListToMap(tokensWithBalances);
    const tokens = list.map(token => {
      const foundTokenWithBalance = tokensWithBalancesMap.get(
        this.tokenConverters.getTokenKeyInMap(token)
      );

      if (!foundTokenWithBalance) {
        return token;
      } else {
        return { ...token, amount: foundTokenWithBalance.amount };
      }
    });

    _listSubj$.next(tokens);
  }

  /**
   * used to dynamically update tokensToShow balances in `fetchQueryTokensDynamically`
   * */
  public patchLastQueriedTokensBalances(tokensWithBalances: List<TokenAmount>): void {
    const tokensWithBalancesMap = this.tokenConverters.convertTokensListToMap(tokensWithBalances);
    const lastQueriedTokensWithBalances = this.lastQueriedTokens.map(token => {
      const foundTokenWithBalance = tokensWithBalancesMap.get(
        this.tokenConverters.getTokenKeyInMap(token)
      );

      if (!foundTokenWithBalance) {
        return token;
      } else {
        return { ...token, amount: foundTokenWithBalance.amount };
      }
    });

    this.updateLastQueriedTokens(lastQueriedTokensWithBalances);
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
