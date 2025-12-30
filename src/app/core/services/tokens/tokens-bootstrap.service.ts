import { inject, Injectable } from '@angular/core';
import { Token } from '@shared/models/tokens/token';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { BlockchainName } from '@cryptorubic/core';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';
import { TokensCollectionsFacadeService } from '@core/services/tokens/tokens-collections-facade.service';

@Injectable({
  providedIn: 'root'
})
export class TokensBootstrapService {
  private readonly tokensStore = inject(NewTokensStoreService);

  private readonly apiService = inject(NewTokensApiService);

  private readonly tokensCollectionsFacade = inject(TokensCollectionsFacadeService);

  private readonly _tier1TokensLoaded$ = new BehaviorSubject<boolean>(false);

  public readonly tier1TokensLoaded$ = this._tier1TokensLoaded$.asObservable();

  public buildTokenLists(): void {
    Promise.all([this.buildTier1List(), this.buildTier2List()]).then(
      ([tier1Tokens, tier2Tokens]) => {
        this.tokensCollectionsFacade.allTokens.updateTokenSync([...tier1Tokens, ...tier2Tokens]);
        this.buildUtilityList();
      }
    );
  }

  private buildUtilityList(): void {
    this.apiService.getUtilityTokenList().subscribe(utilityTokens => {
      this.tokensCollectionsFacade.allTokens.addMissedUtilityTokens([
        ...utilityTokens.gainers,
        ...utilityTokens.losers,
        ...utilityTokens.trending
      ]);
      this.tokensCollectionsFacade.gainers.updateTokenSync(utilityTokens.gainers);
      this.tokensCollectionsFacade.losers.updateTokenSync(utilityTokens.losers);
      this.tokensCollectionsFacade.trending.updateTokenSync(utilityTokens.trending);
    });
  }

  private async buildTier1List(): Promise<Token[]> {
    const tokens = await firstValueFrom(this.apiService.getTopTokens());
    Object.entries(tokens).forEach(([blockchain, blockchainTokens]) => {
      this.tokensStore.addInitialBlockchainTokens(blockchain as BlockchainName, blockchainTokens);
    });
    const tokensArray = Object.values(tokens)
      .map(el => el.list)
      .flat();
    this._tier1TokensLoaded$.next(true);

    return tokensArray;
  }

  private async buildTier2List(): Promise<Token[]> {
    const tokens = await firstValueFrom(this.apiService.getRestTokens());
    const tokensArray = Object.entries(tokens).flatMap(el => el[1].list);
    Object.entries(tokens).forEach(([blockchain, blockchainTokens]) => {
      this.tokensStore.addInitialBlockchainTokens(blockchain as BlockchainName, blockchainTokens);
    });
    return tokensArray;
  }
}
