import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class OrderExpirationService {
  /**
   * Stores expiration time in minutes.
   */
  private readonly _expirationTime$ = new BehaviorSubject(7 * 24 * 60);

  public readonly expirationTime$ = this._expirationTime$.asObservable();

  public get expirationTime(): number {
    return this._expirationTime$.getValue();
  }

  public updateExpirationTime(minutes: number): void {
    this._expirationTime$.next(minutes);
  }
}
