import { Injectable } from '@angular/core';
import {
  TokensNetworkState,
  TokensNetworkStateKey
} from '@app/shared/models/tokens/paginated-tokens';
import { BehaviorSubject, Subject } from 'rxjs';
import { TOKENS_PAGINATION } from './constants/tokens-pagination';

@Injectable({
  providedIn: 'root'
})
export class TokensNetworkStateService {
  /**
   * Current tokens request options state.
   */
  private readonly _tokensRequestParameters$ = new Subject<{ [p: string]: unknown }>();

  public readonly tokensRequestParameters$ = this._tokensRequestParameters$.asObservable();

  /**
   * Current tokens network state.
   */
  private readonly _tokensNetworkState$ = new BehaviorSubject<TokensNetworkState>(
    TOKENS_PAGINATION
  );

  public readonly tokensNetworkState$ = this._tokensNetworkState$.asObservable();

  public get tokensNetworkState(): TokensNetworkState {
    return this._tokensNetworkState$.value;
  }

  public updateTokensNetworkState(newState: TokensNetworkState): void {
    this._tokensNetworkState$.next(newState);
  }

  /**
   * Sets new tokens request options.
   */
  public setTokensRequestParameters(parameters: { [p: string]: unknown }): void {
    this._tokensRequestParameters$.next(parameters);
  }

  public getNextPageCountForSpecificSelector(tokensNetworkKey: TokensNetworkStateKey): number {
    const page = Math.max(2, this._tokensNetworkState$.value[tokensNetworkKey].page);
    return page;
  }
}
