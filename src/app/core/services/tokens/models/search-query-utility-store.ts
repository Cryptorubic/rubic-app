import { BasicUtilityStore } from '@core/services/tokens/models/basic-utility-store';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { Observable, of } from 'rxjs';
import { Token } from '@shared/models/tokens/token';
import { TokenRef } from '@core/services/tokens/models/new-token-types';
import { BlockchainName } from '@cryptorubic/core';

export class SearchQueryUtilityStore extends BasicUtilityStore {
  constructor(
    tokensStore: NewTokensStoreService,
    private readonly apiService: NewTokensApiService
  ) {
    super(tokensStore);
  }

  public fetchTokens(): Observable<Token[]> {
    return of([]);
  }

  public handleSearchQuery(query: string, blockchain: BlockchainName | null): void {
    this._pageLoading$.next(true);
    this.apiService.fetchQueryTokens(query, blockchain).subscribe(tokens => {
      this.addMissedUtilityTokens(tokens);
      const searchedTokens: TokenRef[] = tokens.map(token => ({
        address: token.address,
        blockchain: token.blockchain
      }));
      this._refs$.next(searchedTokens);
      this._pageLoading$.next(false);
    });
  }
}
