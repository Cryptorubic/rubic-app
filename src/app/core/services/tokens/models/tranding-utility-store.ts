import { BasicUtilityStore } from '@core/services/tokens/models/basic-utility-store';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { Observable } from 'rxjs';
import { Token } from '@shared/models/tokens/token';

export class TrendingUtilityStore extends BasicUtilityStore {
  constructor(
    tokensStore: NewTokensStoreService,
    private readonly apiService: NewTokensApiService
  ) {
    super(tokensStore);
  }

  public fetchTokens(): Observable<Token[]> {
    return this.apiService.fetchTrendTokens();
  }
}
