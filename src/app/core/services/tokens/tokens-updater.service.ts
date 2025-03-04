import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TokensUpdaterService {
  private readonly _tokensLoading$ = new BehaviorSubject<boolean>(false);

  public readonly tokensLoading$ = this._tokensLoading$.asObservable();

  /**
   * Emits events, when list must be updated.
   */
  private readonly _updateTokensList$ = new BehaviorSubject<{ skipRefetch: boolean }>({
    skipRefetch: false
  });

  public readonly updateTokensList$ = this._updateTokensList$.asObservable();

  public get tokensLoading(): boolean {
    return this._tokensLoading$.value;
  }

  public setTokensLoading(value: boolean): void {
    this._tokensLoading$.next(value);
  }

  public triggerUpdateTokens(options: { skipRefetch?: boolean } = {}): void {
    this._updateTokensList$.next({ skipRefetch: options.skipRefetch ?? false });
  }
}
