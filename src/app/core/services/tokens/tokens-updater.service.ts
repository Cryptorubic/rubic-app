import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TokensUpdaterService {
  /**
   * Emits events, when list must be updated.
   */
  private readonly _updateTokensList$ = new Subject<void>();

  public readonly updateTokensList$ = this._updateTokensList$.asObservable();

  public triggerUpdateTokens(): void {
    this._updateTokensList$.next();
  }
}
