import { BasicUtilityStore } from '@core/services/tokens/models/basic-utility-store';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { Observable, of } from 'rxjs';
import { Token } from '@shared/models/tokens/token';
import { TokenRef } from '@core/services/tokens/models/new-token-types';
import { tap } from 'rxjs/operators';
import { BlockchainName } from '@cryptorubic/core';

export class AllTokensUtilityStore extends BasicUtilityStore {
  protected override readonly useLocalSearch = false;
  // private readonly _searchRefs$ = new BehaviorSubject<TokenRef[]>([]);
  //
  // public readonly searchRefs$ = this._searchRefs$.asObservable();
  //
  // public readonly conditionRefs$ = this.searchQuery$.pipe(
  //   switchMap(searchQuery =>
  //     iif(() => !!searchQuery && searchQuery.length > 2, this.searchRefs$, this._refs$)
  //   )
  // );
  //
  // public readonly tokens$ = this.conditionRefs$.pipe(
  //   combineLatestWith(
  //     this.searchQuery$,
  //     ...Object.values(this.tokensStore.tokens).map(t =>
  //       t.tokens$.pipe(map(el => ({ chain: t.blockchain, list: el })))
  //     )
  //   ),
  //   map(([utilityTokens, searchQuery, ...allTokens]) => {
  //     const tokens = utilityTokens.map(ref => {
  //       const chainTokens = allTokens.find(el => el.chain === ref.blockchain)!;
  //       const foundToken = chainTokens.list.find(t => t.address === ref.address);
  //
  //       if (!foundToken) {
  //         throw new Error(
  //           `Token not found in all tokens store: ${ref.blockchain} - ${ref.address}`
  //         );
  //       }
  //       return foundToken;
  //     });
  //     const filteredTokens =
  //       searchQuery && searchQuery.length > 2
  //         ? tokens.filter(
  //             token =>
  //               token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //               token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //               compareAddresses(searchQuery, token.address)
  //           )
  //         : tokens;
  //     return filteredTokens;
  //   })
  // );

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
    const sortedTokens = tokens.sort((a, b) => {
      const aTotalRank = a.rank * (a?.networkRank || 1);
      const bTotalRank = b.rank * (b?.networkRank || 1);
      return aTotalRank > bTotalRank ? -1 : 1;
    });

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
      .fetchQueryTokens(query, blockchain)
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
    if (query.length > 2) {
      this.fetchQueryTokens(query, null);
    } else {
      this._searchRefs$.next([]);
    }
  }
}
