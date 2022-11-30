import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Data store to use inside header module.
 */
@Injectable({
  providedIn: 'root'
})
export class HeaderStore {
  /**
   * Maximum size of mobile device.
   */
  public readonly mobileWidth = 1023;

  private _forceDesktopResolution: boolean;

  /**
   * Determines if confirm logout modal is active.
   */
  private readonly _isConfirmModalOpened$ = new BehaviorSubject<boolean>(false);

  public readonly isConfirmModalOpened$ = this._isConfirmModalOpened$.asObservable();

  /**
   * Determines if mobile navigation menu is active.
   */
  private readonly _isMobileMenuOpened$ = new BehaviorSubject<boolean>(false);

  public readonly isMobileMenuOpened$ = this._isMobileMenuOpened$.asObservable();

  /**
   * Determines if current window width is similar to mobile.
   */
  private readonly _isMobile$ = new BehaviorSubject<boolean>(false);

  public readonly isMobile$ = this._isMobile$.asObservable();

  /**
   * Returns true if current window width is similar to mobile synchronously.
   */
  public get isMobile(): boolean {
    return this._isMobile$.getValue();
  }

  /**
   * Should wallets buttons be disabled or not.
   */
  private readonly _walletsLoadingStatus$ = new BehaviorSubject<boolean>(false);

  public readonly walletsLoadingStatus$ = this._walletsLoadingStatus$.asObservable();

  constructor() {}

  public setWalletsLoadingStatus(status: boolean): void {
    return this._walletsLoadingStatus$.next(status);
  }

  public setConfirmModalOpeningStatus(value: boolean): void {
    this._isConfirmModalOpened$.next(value);
  }

  public setMobileMenuOpeningStatus(value: boolean): void {
    this._isMobileMenuOpened$.next(value);
  }

  public toggleMobileMenuOpeningStatus(): void {
    const currentValue = this._isMobileMenuOpened$.value;
    this._isMobileMenuOpened$.next(!currentValue);
  }

  public set forceDesktopResolution(isDesktop: string) {
    this._forceDesktopResolution = isDesktop === 'true';
  }

  public setMobileDisplayStatus(status: boolean): void {
    this._isMobile$.next(this._forceDesktopResolution ? false : status);
  }
}
