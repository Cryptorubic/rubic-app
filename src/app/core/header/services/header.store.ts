import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private readonly $isConfirmModalOpened: BehaviorSubject<boolean>;

  /**
   * Determines if mobile navigation menu is active.
   */
  private readonly $isMobileMenuOpened: BehaviorSubject<boolean>;

  /**
   * Determines if current window width is similar to mobile.
   */
  private readonly $isMobile: BehaviorSubject<boolean>;

  /**
   * Logout confirmation modal reference.
   */
  public logoutConfirmationModal: MatDialogRef<any>;

  /**
   * Maximum size of mobile device.
   */
  public readonly mobileWidth: number;

  constructor() {
    const mobileWidth = 1024;
    this.mobileWidth = mobileWidth;
    this.$isConfirmModalOpened = new BehaviorSubject<boolean>(false);
    this.$isMobileMenuOpened = new BehaviorSubject<boolean>(false);
    this.$isMobile = new BehaviorSubject<boolean>(false);
  }

  public getConfirmModalOpeningStatus(): Observable<boolean> {
    return this.$isConfirmModalOpened.asObservable();
  }

  public setConfirmModalOpeningStatus(value: boolean): void {
    this.$isConfirmModalOpened.next(value);
  }

  public toggleConfirmModalOpeningStatus(): void {
    const currentValue = this.$isConfirmModalOpened.value;
    this.$isConfirmModalOpened.next(!currentValue);
  }

  public getMobileMenuOpeningStatus(): Observable<boolean> {
    return this.$isMobileMenuOpened.asObservable();
  }

  public setMobileMenuOpeningStatus(value): void {
    this.$isMobileMenuOpened.next(value);
  }

  public toggleMobileMenuOpeningStatus(): void {
    const currentValue = this.$isMobileMenuOpened.value;
    this.$isMobileMenuOpened.next(!currentValue);
  }

  public getMobileDisplayStatus(): Observable<boolean> {
    return this.$isMobile.asObservable();
  }

  public setMobileDisplayStatus(status: boolean): void {
    this.$isMobile.next(status);
  }
}
