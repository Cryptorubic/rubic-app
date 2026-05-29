import { BasicUtilityStore } from '@core/services/tokens/models/basic-utility-store';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { Observable, of } from 'rxjs';
import { Token } from '@shared/models/tokens/token';
import { TokenRef } from '@core/services/tokens/models/new-token-types';
import { tap } from 'rxjs/operators';
import { BlockchainName } from '@cryptorubic/core';
import { TokensSorter } from '@core/services/tokens/utils/token-sorter';

export class AllTokensUtilityStore extends BasicUtilityStore {
  protected override readonly useLocalSearch = false;

  constructor(
    tokensStore: NewTokensStoreService,
    private readonly apiService: NewTokensApiService
  ) {
    super(tokensStore);
  }

  public fetchTokens(): Observable<Token[]> {
    return of([]);
  }

  public override updateTokenSync(tokens: Token[]): void {
    this._pageLoading$.next(true);

    const refs: TokenRef[] = [];
    const sorter = new TokensSorter();
    const sortedTokens = sorter.sortTokensRankNetworkWithCooldown(tokens);

    sortedTokens.forEach(token => {
      refs.push({
        address: token.address,
        blockchain: token.blockchain
      });
    });

    this._storedRefs$.next(refs);
    this._pageLoading$.next(false);
  }

  public fetchQueryTokens(query: string, blockchain: BlockchainName | null): void {
    this._pageLoading$.next(true);
    this.apiService
      .fetchQueryTokens({ query, blockchain })
      .pipe(
        tap(tokens => {
          const refs = tokens.map(token => ({
            blockchain: token.blockchain,
            address: token.address
          }));
          this._searchRefs$.next(refs);
          this.addMissedUtilityTokens(tokens);
          this._pageLoading$.next(false);
        })
      )
      .subscribe();
  }

  public override setQuery(query: string): void {
    super.setQuery(query);
    if (query.length >= 2) {
      this.fetchQueryTokens(query, null);
    } else {
      this._searchRefs$.next([]);
    }
  }
}
