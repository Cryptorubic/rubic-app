import { AllTokensUtilityStore } from '@core/services/tokens/models/all-tokens-utility-store';
import { FavoriteUtilityStore } from '@core/services/tokens/models/favorite-utility-store';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TokensCollectionsFacadeService {
  private readonly tokensStore = inject(NewTokensStoreService);

  private readonly apiService = inject(NewTokensApiService);

  private readonly authService = inject(AuthService);

  public readonly allTokens = new AllTokensUtilityStore(this.tokensStore, this.apiService).init();

  public readonly favorite = new FavoriteUtilityStore(
    this.tokensStore,
    this.apiService,
    this.authService
  ).init();

  public readonly blockchainTokens = this.tokensStore.tokens;
}
