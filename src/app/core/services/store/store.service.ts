import { Inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DOCUMENT } from '@angular/common';
import { LOCAL_STORAGE } from '@ng-web-apis/common';
import { Store, storeRecord } from 'src/app/core/services/store/models/store';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  constructor(
    private readonly cookieService: CookieService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(LOCAL_STORAGE) private localStorage: Storage
  ) {}

  /**
   * Set some store data by key.
   * @param key Store object key.
   * @param value Value to store.
   */
  public setItem<T extends keyof Store>(key: T, value: Store[T]): void {
    try {
      this.localStorage?.setItem(key, JSON.stringify(value));
    } catch (err: unknown) {
      console.debug(err);
    }
  }

  /**
   * Get store item by key.
   * @param key Store key.
   */
  public getItem<T extends keyof Store>(key: T): Store[T] {
    try {
      const data = this.fetchData();
      return data?.[key];
    } catch {
      console.debug(`Can not get key: ${key}`);
      return undefined;
    }
  }

  /**
   * Fetch stored data from local storage or cookies.
   */
  public fetchData(): Store {
    try {
      const storage = { ...this.localStorage };
      const storeObject = Object.entries(storeRecord);
      const rubicStoreFields = storeObject
        .map(([key]) => [key, storage?.[key] ? JSON.parse(storage[key]) : null])
        .filter(([, value]) => Boolean(value));
      const rubicStorage = Object.fromEntries(rubicStoreFields);
      return rubicStorage as unknown as Store;
    } catch (err: unknown) {
      console.debug(err);
      return {} as Store;
    }
  }

  /**
   * Delete store item data by key.
   * @param key Store key.
   */
  public deleteItem(key: keyof Store): void {
    try {
      this.localStorage?.removeItem(key);
    } catch (err: unknown) {
      console.debug(err);
    }
  }
}
