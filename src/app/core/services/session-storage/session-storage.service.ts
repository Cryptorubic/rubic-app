import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  constructor() {}

  public setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (err: unknown) {
      console.debug(err);
    }
  }

  public getItem(key: string): string {
    try {
      return sessionStorage.getItem(key);
    } catch {
      console.debug(`Can not get key: ${key}`);
      return undefined;
    }
  }

  public deleteItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (err: unknown) {
      console.debug(err);
    }
  }
}
