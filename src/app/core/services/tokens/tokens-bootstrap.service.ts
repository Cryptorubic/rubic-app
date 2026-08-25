import { inject, Injectable } from '@angular/core';
import { Token } from '@shared/models/tokens/token';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { BlockchainName } from '@cryptorubic/core';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';
import { TokensCollectionsFacadeService } from '@core/services/tokens/tokens-collections-facade.service';
import { TransferTokensService } from '@core/services/tokens/transfer-tokens.service';

@Injectable({
  providedIn: 'root'
})
export class TokensBootstrapService {
  protected readonly tokensStore = inject(NewTokensStoreService);

  protected readonly apiService = inject(NewTokensApiService);

  protected readonly tokensCollectionsFacade = inject(TokensCollectionsFacadeService);

  private readonly transferTokensService = inject(TransferTokensService);

  protected readonly _tier1TokensLoaded$ = new BehaviorSubject<boolean>(false);

  public readonly tier1TokensLoaded$ = this._tier1TokensLoaded$.asObservable();

  public buildTokenLists(): void {
    Promise.all([this.buildTier1List(), this.buildTier2List()]).then(
      ([tier1Tokens, tier2Tokens]) => {
        this.tokensCollectionsFacade.allTokens.updateTokenSync([...tier1Tokens, ...tier2Tokens]);
      }
    );
  }

  public buildTransferTokenList(): void {
    this.apiService.fetchTransferTokens().subscribe(tokens => {
      this.transferTokensService.setTokens(tokens);
      this.addTransferTokensToStore(tokens);
    });
  }

  private addTransferTokensToStore(tokens: BalanceToken[]): void {
    const tokensByChain = tokens.reduce(
      (acc, token) => {
        if (!acc[token.blockchain]) {
          acc[token.blockchain] = [];
        }
        acc[token.blockchain]!.push(token);
        return acc;
      },
      {} as Partial<Record<BlockchainName, BalanceToken[]>>
    );

    Object.entries(tokensByChain).forEach(([blockchain, chainTokens]) => {
      this.tokensStore.updateBlockchainTokens(blockchain as BlockchainName, chainTokens);
    });
  }

  protected async buildTier1List(): Promise<Token[]> {
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
