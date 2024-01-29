import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WINDOW } from '@ng-web-apis/common';

/**
 * Data store to use inside header module.
 */
@Injectable({
  providedIn: 'root'
})
export class HeaderStore {
  /**
   * Determines if confirm logout modal is active.
   */
  private readonly isConfirmModalOpened$: BehaviorSubject<boolean>;

  /**
   * Determines if mobile navigation menu is active.
   */
  private readonly isMobileMenuOpened$: BehaviorSubject<boolean>;

  /**
   * Determines if current window width is similar to mobile.
   */
  private readonly isMobile$: BehaviorSubject<boolean>;

  /**
   * Should wallets buttons be disabled or not.
   */
  private walletsLoadingStatusSubject$: BehaviorSubject<boolean>;

  /**
   * Maximum size of mobile device.
   */
  public readonly mobileWidth: number;

  public readonly isQHDResolution =
    this.window.innerWidth >= 2560 && this.window.innerWidth <= 3840;

  public readonly isUHDResolution = this.window.innerWidth >= 3840;

  /**
   * Returns true if current window width is similar to mobile synchronously.
   */
  public get isMobile(): boolean {
    return this.isMobile$.getValue();
  }

  private _forceDesktopResolution: boolean;

  constructor(@Inject(WINDOW) private readonly window: Window) {
    this.walletsLoadingStatusSubject$ = new BehaviorSubject<boolean>(false);
    this.mobileWidth = 651;
    this.isConfirmModalOpened$ = new BehaviorSubject<boolean>(false);
    this.isMobileMenuOpened$ = new BehaviorSubject<boolean>(false);
    this.isMobile$ = new BehaviorSubject<boolean>(false);
  }

  public getConfirmModalOpeningStatus(): Observable<boolean> {
    return this.isConfirmModalOpened$.asObservable();
  }

  public setConfirmModalOpeningStatus(value: boolean): void {
    this.isConfirmModalOpened$.next(value);
  }

  public getWalletsLoadingStatus(): Observable<boolean> {
    return this.walletsLoadingStatusSubject$.asObservable();
  }

  public setWalletsLoadingStatus(status: boolean): void {
    return this.walletsLoadingStatusSubject$.next(status);
  }

  public toggleConfirmModalOpeningStatus(): void {
    const currentValue = this.isConfirmModalOpened$.value;
    this.isConfirmModalOpened$.next(!currentValue);
  }

  public getMobileMenuOpeningStatus(): Observable<boolean> {
    return this.isMobileMenuOpened$.asObservable();
  }

  public setMobileMenuOpeningStatus(value: boolean): void {
    this.isMobileMenuOpened$.next(value);
  }

  public toggleMobileMenuOpeningStatus(): void {
    const currentValue = this.isMobileMenuOpened$.value;
    this.isMobileMenuOpened$.next(!currentValue);
  }

  public getMobileDisplayStatus(): Observable<boolean> {
    return this.isMobile$.asObservable();
  }

  public set forceDesktopResolution(isDesktop: string) {
    this._forceDesktopResolution = isDesktop === 'true';
  }

  public setMobileDisplayStatus(status: boolean): void {
    this.isMobile$.next(this._forceDesktopResolution ? false : status);
  }
}
