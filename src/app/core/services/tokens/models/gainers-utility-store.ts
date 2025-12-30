import { BasicUtilityStore } from '@core/services/tokens/models/basic-utility-store';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { Observable } from 'rxjs';
import { Token } from '@shared/models/tokens/token';
import { TokenRef } from '@core/services/tokens/models/new-token-types';
import { sorterForGainers } from '@features/trade/components/assets-selector/services/tokens-list-service/utils/sorters';

export class GainersUtilityStore extends BasicUtilityStore {
  constructor(
    tokensStore: NewTokensStoreService,
    private readonly apiService: NewTokensApiService
  ) {
    super(tokensStore);
  }

  public override getTokenRefs(tokens: Token[]): TokenRef[] {
    const sorted = tokens.sort(sorterForGainers);
    return sorted.map(token => ({
      address: token.address,
      blockchain: token.blockchain
    }));
  }

  public fetchTokens(): Observable<Token[]> {
    return this.apiService.fetchGainersTokens();
  }
}
