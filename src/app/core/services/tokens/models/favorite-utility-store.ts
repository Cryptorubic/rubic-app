import { BasicUtilityStore } from '@core/services/tokens/models/basic-utility-store';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { combineLatestWith, Observable, of } from 'rxjs';
import { Token } from '@shared/models/tokens/token';
import { AuthService } from '@core/services/auth/auth.service';
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { TokenRef } from '@core/services/tokens/models/new-token-types';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { compareAddresses } from '@cryptorubic/core';
import { compareTokens } from '@shared/utils/utils';

export class FavoriteUtilityStore extends BasicUtilityStore {
  public override readonly tokens$ = this.refs$.pipe(
    combineLatestWith(this.tokensStore.allTokens$),
    map(([refs, allTokens]) => {
      const tokens = refs
        .map(ref =>
          allTokens.find(token => {
            const similarChain = ref?.blockchain === token?.blockchain;
            const similarAddress = ref?.address === token?.address;
            const similarToken = compareTokens(ref, token);
            return (similarChain && similarAddress) || similarToken;
          })
        )
        .filter(Boolean);
      const searchQuery = this._searchQuery$.value;
      const filteredTokens =
        searchQuery && searchQuery.length > 2 && tokens.length && this.useLocalSearch
          ? tokens.filter(
              token =>
                token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                compareAddresses(searchQuery, token.address)
            )
          : tokens;
      return filteredTokens.map(token => ({ ...token, favorite: true }));
    }),
    debounceTime(30)
  );

  constructor(
    tokensStore: NewTokensStoreService,
    private readonly apiService: NewTokensApiService,
    private readonly authService: AuthService
  ) {
    super(tokensStore);
    this.handleAddressSubscribe();
  }

  protected override buildInitialList(): void {}

  public fetchTokens(): Observable<Token[]> {
    return of([]);
  }

  private handleAddressSubscribe(): void {
    this.authService.currentUser$
      .pipe(
        distinctUntilChanged((a, b) => a?.address === b?.address),
        tap(user => {
          if (user?.address) {
            this._pageLoading$.next(true);
          }
        }),
        switchMap(user => (user?.address ? this.apiService.fetchFavoriteTokens() : of([]))),
        tap(tokens => {
          this.addMissedUtilityTokens(tokens);
          const favoriteTokens: TokenRef[] = tokens.map(token => ({
            address: token.address,
            blockchain: token.blockchain
          }));
          this._storedRefs$.next(favoriteTokens);
          this._pageLoading$.next(false);
        })
      )
      .subscribe();
  }

  /**
   * Adds token to list of favorite tokens.
   * @param favoriteToken Favorite token to add.
   */
  public addFavoriteToken(favoriteToken: BalanceToken): Observable<unknown> {
    this._pageLoading$.next(true);
    return this.apiService.addFavoriteToken(favoriteToken).pipe(
      tap(() => {
        const oldTokens = this._storedRefs$.value;
        this._storedRefs$.next([
          ...oldTokens,
          { address: favoriteToken.address, blockchain: favoriteToken.blockchain }
        ]);
        this._pageLoading$.next(false);
      })
    );
  }

  /**
   * Removes token from list of favorite tokens.
   * @param token Favorite token to remove.
   */
  public removeFavoriteToken(token: BalanceToken): Observable<unknown> {
    this._pageLoading$.next(true);
    return this.apiService.deleteFavoriteToken(token).pipe(
      tap(() => {
        const filteredTokens = this._storedRefs$.value.filter(
          el => !compareAddresses(el.address, token.address)
        );
        this._storedRefs$.next(filteredTokens);
        this._pageLoading$.next(false);
      })
    );
  }
}
