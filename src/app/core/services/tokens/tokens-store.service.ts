import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, forkJoin, from, Observable, of } from 'rxjs';
import { List } from 'immutable';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { catchError, debounceTime, first, map, switchMap, tap } from 'rxjs/operators';
import { TokensApiService } from '@core/services/backend/tokens-api/tokens-api.service';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { Token } from '@shared/models/tokens/token';
import BigNumber from 'bignumber.js';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  BlockchainsInfo,
  EvmBlockchainName,
  Injector,
  Web3Public,
  Web3Pure
} from 'rubic-sdk';
import { Token as SdkToken } from 'rubic-sdk/lib/common/tokens/token';
import { compareObjects, compareTokens } from '@shared/utils/utils';
import { StoreService } from '@core/services/store/store.service';
import { isTokenAmount } from '@shared/utils/is-token';
import { StorageToken } from '@core/services/tokens/models/storage-token';
import { AssetType } from '@app/features/trade/models/asset';

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

  private storageTokens: StorageToken[];

  private isBalanceAlreadyCalculatedForChain: Record<AssetType, boolean> = [
    ...Object.values(BLOCKCHAIN_NAME),
    'allChains'
  ].reduce(
    (acc, blockchain) => ({ ...acc, [blockchain]: false }),
    {} as Record<AssetType, boolean>
  );

  private _isBalanceLoading$: Record<AssetType, BehaviorSubject<boolean>> = [
    ...Object.values(BLOCKCHAIN_NAME),
    'allChains'
  ].reduce(
    (acc, blockchain) => ({ ...acc, [blockchain]: new BehaviorSubject(true) }),
    {} as Record<AssetType, BehaviorSubject<boolean>>
  );

  private get userAddress(): string | undefined {
    return this.authService.userAddress;
  }

  constructor(
    private readonly tokensApiService: TokensApiService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly storeService: StoreService
  ) {
    this.setupStorageTokens();
    this.setupSubscriptions();
  }

  public setupStorageTokens(): void {
    this.storageTokens = this.storeService.getItem('RUBIC_TOKENS') || [];
    if (this.storageTokens.length) {
      const tokens = this.getDefaultTokenAmounts(
        List(this.storageTokens.map(token => ({ ...token, price: 0 }))),
        false
      );
      this._tokens$.next(tokens);
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
          return (
            await this.getTokensWithBalance(
              this.getDefaultTokenAmounts(List(favoriteTokensByBlockchain), true)
            )
          ).toArray();
        })
      )
    ).flat();
  }

  public startBalanceCalculating(blockchain: BlockchainName | 'allChains'): void {
    if (this.isBalanceAlreadyCalculatedForChain[blockchain]) {
      return;
    }

    combineLatest([
      this.tokens$.pipe(
        first(v => Boolean(v)),
        map(tokens => tokens.filter(t => blockchain === 'allChains' || t.blockchain === blockchain))
      ),
      this.authService.currentUser$
    ])
      .pipe(
        debounceTime(100),
        switchMap(([tokens, user]) => {
          this._isBalanceLoading$[blockchain].next(true);
          if (!user) return this.getDefaultTokenAmounts(tokens, false);

          return this.getTokensWithBalance(tokens);
        }),
        catchError(() => of(List()))
      )
      .subscribe((tokensWithBalances: List<TokenAmount>) => {
        this.patchTokensBalances(tokensWithBalances);
        this._isBalanceLoading$[blockchain].next(false);
        this.isBalanceAlreadyCalculatedForChain[blockchain] = true;
      });
  }

  public balanceCalculatingStarted(blockchain: BlockchainName): boolean {
    return this.isBalanceAlreadyCalculatedForChain[blockchain];
  }

  public isBalanceLoading$(blockchain: AssetType): Observable<boolean> {
    return this._isBalanceLoading$[blockchain].asObservable();
  }

  /**
   * @param tokensList list of tokens, tokens can be from different chains in same list
   * @returns list of tokens from store with balances
   */
  public async getTokensWithBalance(
    tokensList: List<TokenAmount | Token>
  ): Promise<List<TokenAmount>> {
    const tokensByChain: Record<BlockchainName, Token[]> = {} as Record<BlockchainName, Token[]>;
    // const tokensByChainWithBalancesMap: Map<
    //   BlockchainName,
    //   Record<string, TokenAmount>
    // > = new Map() as Map<BlockchainName, Record<string, TokenAmount>>;

    for (const token of tokensList) {
      const chainTokensList = tokensByChain[token.blockchain];
      if (!Array.isArray(chainTokensList)) {
        tokensByChain[token.blockchain] = [] as Token[];
      }
      // if (!tokensByChainWithBalancesMap.has(token.blockchain)) {
      //   tokensByChainWithBalancesMap.set(token.blockchain, {} as Record<string, TokenAmount>);
      // }

      // const chainTokensWithBalances = tokensByChainWithBalancesMap.get(token.blockchain);
      // chainTokensWithBalances[token.address] =
      //   this.tokens.find(t => compareAddresses(t.address, token.address)) ||
      //   this.getDefaultTokenAmounts(List([token]), false).get(0);

      if (isTokenAmount(token)) {
        tokensByChain[token.blockchain].push(token);
      } else {
        tokensByChain[token.blockchain].push(
          this.getDefaultTokenAmounts(List([token]), false).get(0)
        );
      }
    }

    try {
      const promises = Object.entries(tokensByChain).map(
        ([chain, tokens]: [BlockchainName, Token[]]) => {
          const doesWalletSupportsTokenChain =
            BlockchainsInfo.getChainType(chain) === this.authService.userChainType;
          // if EVM-address used -> it will fetch only evm address etc.
          if (!doesWalletSupportsTokenChain) return tokens.map(() => new BigNumber(NaN));

          // @TODO try in perfomance
          // if (this.isBalanceAlreadyCalculatedForChain[chain]) {
          //   return tokens.map(
          //     token =>
          //       this.tokens.find(t => compareAddresses(t.address, token.address)).amount ||
          //       new BigNumber(NaN)
          //   );
          // }

          const web3Public = Injector.web3PublicService.getWeb3Public(chain) as Web3Public;
          const chainTokensBalances = web3Public
            .getTokensBalances(
              this.userAddress,
              tokens.map(t => t.address)
            )
            .catch((): Array<BigNumber> => tokens.map(() => new BigNumber(NaN)));

          return chainTokensBalances;
        }
      );

      const resp = await Promise.all(promises);
      const allTokensBalances = resp.flat();
      const allTokensWithAmountArray = Object.values(tokensByChain)
        .flat()
        .map((token, index) => ({
          ...token,
          amount: allTokensBalances[index]
            ? Web3Pure.fromWei(allTokensBalances[index], token.decimals)
            : new BigNumber(NaN)
        })) as TokenAmount[];

      return List(allTokensWithAmountArray);
    } catch (err) {
      console.log('%cgetAllChainsTokenBalances_ERROR', 'color: red; font-size: 20px;', err);
      return List([]);
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
   * Sets default tokens params.
   * @param tokens Tokens list.
   * @param isFavorite Is tokens list favorite.
   */
  public getDefaultTokenAmounts(tokens: List<Token>, isFavorite: boolean): List<TokenAmount> {
    return tokens.map(token => ({
      ...token,
      amount: new BigNumber(NaN),
      favorite: isFavorite
    }));
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
  public patchTokens(newTokens: List<Token | TokenAmount>, isFavorite: boolean): void {
    const tokens = (this.tokens || List([]))
      .map(token => {
        const foundToken = newTokens?.find(tokenWithBalance =>
          compareTokens(token, tokenWithBalance)
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
        newTokens
          .filter(newToken => !this.tokens?.find(token => compareTokens(newToken, token)))
          .map(newToken => {
            if (isTokenAmount(newToken)) {
              return newToken;
            }
            return this.getDefaultTokenAmounts(List([newToken]), isFavorite).get(0);
          })
      );
    this._tokens$.next(tokens);
  }

  public patchTokensBalances(tokensWithBalances: List<TokenAmount>): void {
    const tokens = (this.tokens || List([])).map(token => {
      const foundToken = tokensWithBalances.find(tokenWithBalance =>
        compareTokens(token, tokenWithBalance)
      );
      if (!foundToken) {
        return token;
      } else {
        return {
          ...token,
          amount: foundToken.amount
        };
      }
    });
    this._tokens$.next(tokens);
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
