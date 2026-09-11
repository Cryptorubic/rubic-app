import { inject, Injectable } from '@angular/core';
import { Token } from '@shared/models/tokens/token';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';
import { BlockchainName } from '@cryptorubic/core';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';
import {
  TIER_1_BLOCKCHAINS,
  TIER_2_BLOCKCHAINS
} from '@app/core/services/tokens/constants/blockchains-tiers';
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

  private loadedTokens: Token[] = [];

  private tier2Scheduled = false;

  private tier2Started = false;

  /**
   * Chains, which tokens are being loaded.
   */
  private readonly chainsInFlight = new Set<BlockchainName>();

  public buildTokenLists(): void {
    this.buildTier1List().then(tier1Tokens => {
      this.publishAllChainsTokens(tier1Tokens);
      this.scheduleTier2Load();
    });
  }

  protected async buildTier1List(): Promise<Token[]> {
    const tokens = await firstValueFrom(this.apiService.getTokensByChains(TIER_1_BLOCKCHAINS));
    Object.entries(tokens).forEach(([blockchain, blockchainTokens]) => {
      this.tokensStore.addInitialBlockchainTokens(blockchain as BlockchainName, blockchainTokens);
    });
    this._tier1TokensLoaded$.next(true);

    const tokensArray = Object.values(tokens)
      .map(el => el.list)
      .flat();

    return tokensArray;
  }

  private scheduleTier2Load(): void {
    if (this.tier2Scheduled) {
      return;
    }
    this.tier2Scheduled = true;

    const start = (): void => {
      void this.buildTier2List();
    };

    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(start, { timeout: 3000 });
    } else {
      setTimeout(start, 3000);
    }
  }

  private async buildTier2List(): Promise<void> {
    if (this.tier2Started) {
      return;
    }
    this.tier2Started = true;

    const pendingChains = TIER_2_BLOCKCHAINS.filter(
      chain => this.tokensStore.tokens[chain]?.page === 0 && !this.chainsInFlight.has(chain)
    );
    if (!pendingChains.length) {
      return;
    }

    pendingChains.forEach(chain => this.chainsInFlight.add(chain));
    try {
      const tokens = await firstValueFrom(this.apiService.getTokensByChains(pendingChains));
      const tokensArray = Object.values(tokens).flatMap(el => el.list);
      Object.entries(tokens).forEach(([blockchain, blockchainTokens]) => {
        if (this.tokensStore.tokens[blockchain as BlockchainName]?.page > 0) {
          return;
        }
        this.tokensStore.addInitialBlockchainTokens(blockchain as BlockchainName, blockchainTokens);
      });
      this.publishAllChainsTokens(tokensArray, { silent: true });
    } finally {
      pendingChains.forEach(chain => this.chainsInFlight.delete(chain));
    }
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

  public async loadChainTokens(blockchain: BlockchainName): Promise<void> {
    const alreadyLoaded = () => {
      if (this.tokensStore.tokens[blockchain]?.page > 0) {
        return true;
      }
      if (this.chainsInFlight.has(blockchain)) {
        return true;
      }
      return false;
    };

    if (alreadyLoaded()) {
      return;
    }

    if (!this._tier1TokensLoaded$.value) {
      await firstValueFrom(this.tier1TokensLoaded$.pipe(first(Boolean)));

      if (alreadyLoaded()) {
        return;
      }
    }

    this.chainsInFlight.add(blockchain);
    try {
      await this.fetchChainTokens(blockchain);
    } finally {
      this.chainsInFlight.delete(blockchain);
    }
  }

  private async fetchChainTokens(blockchain: BlockchainName): Promise<void> {
    const tokens = await firstValueFrom(this.apiService.getTokensByChains([blockchain]));
    const chainTokens = tokens[blockchain];
    if (!chainTokens) {
      return;
    }

    if (this.tokensStore.tokens[blockchain]?.page === 0) {
      this.tokensStore.addInitialBlockchainTokens(blockchain, chainTokens);
    }
    this.publishAllChainsTokens(chainTokens.list, { silent: true });
  }

  private publishAllChainsTokens(tokens: Token[], options?: { silent?: boolean }): void {
    this.loadedTokens = this.dedupeTokens([...this.loadedTokens, ...tokens]);
    this.tokensCollectionsFacade.allTokens.updateTokenSync(this.loadedTokens, options);
  }

  private dedupeTokens(tokens: Token[]): Token[] {
    const seen = new Set<string>();
    const result: Token[] = [];

    for (const token of tokens) {
      const key = `${token.blockchain}_${token.address.toLowerCase()}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push(token);
    }

    return result;
  }
}
