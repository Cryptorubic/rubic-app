import { inject, Injectable } from '@angular/core';
import { MinimalToken } from '@shared/models/tokens/minimal-token';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { firstValueFrom, forkJoin, from, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { BlockchainName, BlockchainsInfo, EvmBlockchainName } from '@cryptorubic/core';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { AuthService } from '@core/services/auth/auth.service';
import { SdkLegacyService } from '@core/services/sdk/sdk-legacy/sdk-legacy.service';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';
import { Token } from '@shared/models/tokens/token';
import { TokensBalanceService } from '@core/services/tokens/tokens-balance.service';
import { Web3Pure } from '@cryptorubic/web3';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';

@Injectable({
  providedIn: 'root'
})
export class TokensRegistryService {
  private readonly tokensStore = inject(NewTokensStoreService);

  private readonly sdkLegacyService = inject(SdkLegacyService);

  private readonly authService = inject(AuthService);

  private readonly apiService = inject(NewTokensApiService);

  private readonly balanceService = inject(TokensBalanceService);

  private readonly formService = inject(SwapsFormService);

  public readonly nativeToken$ = this.formService.fromBlockchain$.pipe(
    switchMap(blockchain => {
      const chainType = BlockchainsInfo.getChainType(blockchain);
      const address = Web3Pure.getNativeTokenAddress(chainType);

      return this.findToken({ address, blockchain });
    })
  );

  public findTokenSync(token: MinimalToken, _searchBackend = false): BalanceToken | null {
    const foundToken =
      this.tokensStore.tokens[token.blockchain]._tokensObject$.value[token.address];
    if (foundToken) {
      return foundToken;
    }

    return null;
  }

  public async getLatestPrice(token: {
    address: string;
    blockchain: BlockchainName;
  }): Promise<BigNumber | null> {
    return firstValueFrom(
      this.apiService
        .fetchQueryTokens(token.address, token.blockchain)
        .pipe(map(backendTokens => new BigNumber(backendTokens?.[0]?.price)))
    );
  }

  /**
   * Adds new token to tokens list.
   * @param token Tokens to add.
   */
  public addToken(token: BalanceToken): void {
    this.tokensStore.addNewBlockchainTokens(token.blockchain, [token]);
  }

  public addTokenByAddress(address: string, blockchain: BlockchainName): Observable<BalanceToken> {
    const blockchainAdapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      blockchain as EvmBlockchainName
    );
    const chainType = BlockchainsInfo.getChainType(blockchain);
    const balance$ =
      this.authService.userAddress && this.authService.userChainType === chainType
        ? from(blockchainAdapter.getBalance(this.authService.userAddress, address))
        : of(null);
    const token$ = this.sdkLegacyService.tokenService.createToken({ blockchain, address });

    return forkJoin([token$, balance$]).pipe(
      map(([token, amount]) => ({
        blockchain,
        address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        image: '',
        rank: 1,
        price: null as number | null,
        amount: amount || new BigNumber(NaN)
      })),
      tap((token: BalanceToken) => {
        this.tokensStore.addNewBlockchainTokens(blockchain, [token]);
      })
    );
  }

  public async findToken(token: MinimalToken, searchBackend = false): Promise<BalanceToken | null> {
    const storedToken = this.findTokenSync(token);
    if (storedToken) {
      return storedToken;
    }

    if (searchBackend) {
      return firstValueFrom(
        this.fetchQueryTokens(token.address, token.blockchain).pipe(
          map(backendTokens => {
            return backendTokens.length
              ? { ...backendTokens[0], amount: new BigNumber(NaN), favorite: false }
              : null;
          })
        )
      );
    }

    return null;
  }

  public fetchQueryTokens(query: string, blockchain: BlockchainName | null): Observable<Token[]> {
    return this.apiService.fetchQueryTokens(query, blockchain).pipe(
      switchMap(backendTokens => {
        const tokensWithoutBalance = backendTokens.filter(
          token =>
            !(token.name.toLowerCase().includes('tether') && query.toLowerCase().includes('eth'))
        );
        return this.balanceService.fetchDifferentChainsBalances(tokensWithoutBalance);
      })
    );
  }
}
