import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TokensUpdaterService {
  /**
   * Emits events, when list must be updated.
   */
  private readonly _updateTokensList$ = new BehaviorSubject<{ skipRefetch: boolean }>({
    skipRefetch: false
  });

  public readonly updateTokensList$ = this._updateTokensList$.asObservable();

  public triggerUpdateTokens(options: { skipRefetch?: boolean } = {}): void {
    this._updateTokensList$.next({ skipRefetch: options.skipRefetch ?? false });
  }
}
