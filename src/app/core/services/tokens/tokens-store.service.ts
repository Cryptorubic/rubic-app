import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, forkJoin, from, Observable, of } from 'rxjs';
import { List } from 'immutable';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { debounceTime, first, map, switchMap, tap } from 'rxjs/operators';
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
  Web3PublicSupportedBlockchain,
  Web3Pure
} from 'rubic-sdk';
import { Token as SdkToken } from 'rubic-sdk/lib/common/tokens/token';
import { compareObjects, compareTokens } from '@shared/utils/utils';
import { StoreService } from '@core/services/store/store.service';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { isTokenAmount } from '@shared/utils/is-token';
import { StorageToken } from '@core/services/tokens/models/storage-token';
import { IframeService } from '@core/services/iframe/iframe.service';

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

  private isBalanceCalculatingStarted: Record<BlockchainName, boolean> = Object.values(
    BLOCKCHAIN_NAME
  ).reduce(
    (acc, blockchain) => ({ ...acc, [blockchain]: false }),
    {} as Record<BlockchainName, boolean>
  );

  private _isBalanceLoading$: Record<BlockchainName, BehaviorSubject<boolean>> = Object.values(
    BLOCKCHAIN_NAME
  ).reduce(
    (acc, blockchain) => ({ ...acc, [blockchain]: new BehaviorSubject(true) }),
    {} as Record<BlockchainName, BehaviorSubject<boolean>>
  );

  private get userAddress(): string | undefined {
    return this.authService.userAddress;
  }

  constructor(
    private readonly tokensApiService: TokensApiService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly storeService: StoreService,
    private readonly swapFormService: SwapFormService,
    private readonly iframeService: IframeService
  ) {
    this.setupStorageTokens();

    this.setupSubscriptions();
  }

  public setupStorageTokens(): void {
    this.iframeService.isIframe$.pipe(first(v => v !== undefined)).subscribe(isIframe => {
      if (!isIframe) {
        this.storageTokens = this.storeService.getItem('RUBIC_TOKENS') || [];
        if (this.storageTokens.length) {
          const tokens = this.getDefaultTokenAmounts(
            List(this.storageTokens.map(token => ({ ...token, price: 0 }))),
            false
          );
          this._tokens$.next(tokens);
        }
      }
    });
  }

  private setupSubscriptions(): void {
    this.swapFormService.fromBlockchain$.subscribe(blockchain => {
      if (blockchain) {
        this.startBalanceCalculating(blockchain);
      }
    });
    this.swapFormService.toBlockchain$.subscribe(blockchain => {
      if (blockchain) {
        this.startBalanceCalculating(blockchain);
      }
    });

    this.authService.currentUser$
      .pipe(
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

  public startBalanceCalculating(blockchain: BlockchainName): void {
    if (this.isBalanceCalculatingStarted[blockchain]) {
      return;
    }
    this.isBalanceCalculatingStarted[blockchain] = true;

    combineLatest([
      this.tokens$.pipe(
        first(v => Boolean(v)),
        map(tokens => tokens.filter(t => t.blockchain === blockchain))
      ),
      this.authService.currentUser$
    ])
      .pipe(
        debounceTime(100),
        switchMap(async ([tokens, user]) => {
          if (!user) {
            return this.getDefaultTokenAmounts(tokens, false);
          }
          this._isBalanceLoading$[blockchain].next(true);
          return this.getTokensWithBalance(tokens);
        })
      )
      .subscribe((tokensWithBalances: List<TokenAmount>) => {
        this.patchTokensBalances(tokensWithBalances);
        this._isBalanceLoading$[blockchain].next(false);
      });
  }

  public balanceCalculatingStarted(blockchain: BlockchainName): boolean {
    return this.isBalanceCalculatingStarted[blockchain];
  }

  public isBalanceLoading$(blockchain: BlockchainName): Observable<boolean> {
    return this._isBalanceLoading$[blockchain].asObservable();
  }

  /**
   * Get balance for each token in list. Tokens must be from same blockchain.
   * @param tokens List of tokens.
   * @return Promise<TokenAmount[]> Tokens with balance.
   */
  public async getTokensWithBalance(tokens: List<TokenAmount | Token>): Promise<List<TokenAmount>> {
    try {
      if (!tokens.size) {
        return List([]);
      }
      const blockchain = tokens.get(0).blockchain as Web3PublicSupportedBlockchain;
      tokens.forEach((token, index) => {
        if (index === 0) {
          return;
        }
        if (token.blockchain !== tokens.get(index - 1).blockchain) {
          throw new Error('Blockchain must be the same for all tokens');
        }
      });

      const tokenAmounts = tokens.map(token => {
        if (isTokenAmount(token)) {
          return token;
        }
        return this.getDefaultTokenAmounts(List([token]), false).get(0);
      });

      if (
        !this.userAddress ||
        !this.walletConnectorService.getBlockchainsBasedOnWallet().includes(blockchain)
      ) {
        return tokenAmounts;
      }

      const publicAdapter = Injector.web3PublicService.getWeb3Public(blockchain);
      const balances = await publicAdapter
        .getTokensBalances(this.userAddress, tokens.map(token => token.address).toArray())
        .catch(() => []);

      return tokenAmounts.map((token, index) => ({
        ...token,
        amount: balances[index]
          ? Web3Pure.fromWei(balances[index], token.decimals)
          : new BigNumber(NaN)
      }));
    } catch (err: unknown) {
      console.debug(err);
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
        tokenSecurity: token.tokenSecurity
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
        price: null,
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
}
