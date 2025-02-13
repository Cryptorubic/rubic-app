import { Injectable } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { BehaviorSubject, finalize, forkJoin, Subject } from 'rxjs';
import { first, switchMap, tap } from 'rxjs/operators';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { TokensNetworkState } from '@shared/models/tokens/paginated-tokens';
import { TOKENS_PAGINATION } from '@core/services/tokens/constants/tokens-pagination';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { TokensApiService } from '@core/services/backend/tokens-api/tokens-api.service';
import { AuthService } from '@core/services/auth/auth.service';
import { compareTokens } from '@shared/utils/utils';
import { List } from 'immutable';
import { Token } from '@shared/models/tokens/token';
import { BalanceLoaderService } from './balance-loader.service';
import { BalanceLoadingStateService } from './balance-loading-state.service';
import { TokensUpdaterService } from './tokens-updater.service';

@Injectable({
  providedIn: 'root'
})
export class TokensNetworkService {
  /**
   * Current tokens request options state.
   */
  private readonly _tokensRequestParameters$ = new Subject<{ [p: string]: unknown }>();

  /**
   * Sets new tokens request options.
   */
  public setTokensRequestParameters(parameters: { [p: string]: unknown }): void {
    this._tokensRequestParameters$.next(parameters);
  }

  /**
   * Current tokens network state.
   */
  private readonly _tokensNetworkState$ = new BehaviorSubject<TokensNetworkState>(
    TOKENS_PAGINATION
  );

  public get tokensNetworkState(): TokensNetworkState {
    return this._tokensNetworkState$.value;
  }

  private get userAddress(): string | undefined {
    return this.authService.userAddress;
  }

  constructor(
    private readonly tokensStoreService: TokensStoreService,
    private readonly balanceLoaderService: BalanceLoaderService,
    private readonly balanceLoadingStateService: BalanceLoadingStateService,
    private readonly tokensApiService: TokensApiService,
    private readonly authService: AuthService,
    private readonly tokensUpdaterService: TokensUpdaterService
  ) {
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    this._tokensRequestParameters$
      .pipe(
        switchMap(() => {
          return this.tokensApiService.getTokensList(this._tokensNetworkState$);
        }),
        tap(backendTokens => {
          this.tokensStoreService.updateStorageTokens(backendTokens);
          this.tokensStoreService.patchTokens(backendTokens);
        }),
        switchMap(backendTokens => {
          const uniqueBlockchains = [...new Set(backendTokens.map(bT => bT.blockchain))];
          return Promise.all(
            uniqueBlockchains.map(blockchain =>
              this.addNewTokensWithBalances(backendTokens, blockchain)
            )
          );
        })
      )
      .subscribe();
    this._tokensRequestParameters$.next(undefined);
  }

  private async addNewTokensWithBalances(
    backendTokens: List<Token>,
    blockchain: BlockchainName
  ): Promise<void> {
    const newAddedTokens = backendTokens.filter(
      bT =>
        bT.blockchain === blockchain &&
        !this.tokensStoreService.tokens.some(t => compareTokens(bT, t))
    );
    if (newAddedTokens.size && this.balanceLoadingStateService.isBalanceCalculated(blockchain)) {
      this.tokensStoreService.patchTokensBalances(
        await this.balanceLoaderService.getTokensWithBalance(newAddedTokens)
      );
    }
  }

  /**
   * Updates pagination state for current network.
   * @param blockchain Blockchain name.
   */
  private updateNetworkPage(blockchain: BlockchainName): void {
    const oldState = this._tokensNetworkState$.value;
    const newState = {
      ...oldState,
      [blockchain]: {
        ...oldState[blockchain],
        page: oldState[blockchain].page + 1
      }
    };
    this._tokensNetworkState$.next(newState);
  }

  /**
   * Fetches tokens for specific network.
   * @param blockchain Requested network.
   * @param updateCallback Callback after tokens fetching.
   */
  public fetchNetworkTokens(blockchain: BlockchainName, updateCallback?: () => void): void {
    const page = Math.max(2, this._tokensNetworkState$.value[blockchain].page + 1);
    forkJoin([
      this._tokensNetworkState$.pipe(first(state => state[blockchain].page >= 1)),
      this.tokensApiService.fetchSpecificBackendTokens({
        network: blockchain,
        page
      })
    ])
      .pipe(
        tap(() => this.updateNetworkPage(blockchain)),
        switchMap(async ([_, tokensResponse]) => {
          if (this.userAddress) {
            const tokensWithBalance = await this.balanceLoaderService.getTokensWithBalance(
              tokensResponse.result
            );
            if (tokensWithBalance.size) {
              return tokensWithBalance.toArray();
            }
          }
          return tokensResponse.result;
        }),
        finalize(() => {
          updateCallback?.();
        })
      )
      .subscribe((tokens: TokenAmount[]) => {
        this.tokensStoreService.patchTokens(List(tokens));
        this.tokensUpdaterService.triggerUpdateTokens();
      });
  }
}
