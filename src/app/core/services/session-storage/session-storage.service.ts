import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE } from '@ng-web-apis/common';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  private _sessionID: string | null = null;

  public get sessionID(): string {
    return this._sessionID;
  }

  constructor(@Inject(SESSION_STORAGE) private sessionStorage: Storage) {}

  public setItem(key: string, value: string): void {
    try {
      this.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (err: unknown) {
      console.debug(err);
    }
  }

  public getItem(key: string): string {
    try {
      return JSON.parse(this.sessionStorage.getItem(key));
    } catch {
      console.debug(`Can not get key: ${key}`);
      return undefined;
    }
  }

  public deleteItem(key: string): void {
    try {
      this.sessionStorage.removeItem(key);
    } catch (err: unknown) {
      console.debug(err);
    }
  }

  public loadClientID(): string {
    const sessionID = this.getItem('SESSION_ID');
    if (sessionID) {
      console.log('%csessionID', 'color: aqua;', sessionID);
      this._sessionID = sessionID;
      return sessionID;
    }
    const newSessionID = `user-${Math.random().toString(36).slice(2)}`;
    this._sessionID = newSessionID;
    queueMicrotask(() => {
      this.setItem('SESSION_ID', newSessionID);
    });
    return newSessionID;
  }
}
