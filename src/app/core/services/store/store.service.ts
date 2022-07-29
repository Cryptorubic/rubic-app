import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { DOCUMENT } from '@angular/common';
import { LOCAL_STORAGE } from '@ng-web-apis/common';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { Store } from 'src/app/core/services/store/models/store';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  /**
   * Data stored.
   */
  private readonly storageSubject$: BehaviorSubject<Store>;

  /**
   * Key to store data.
   */
  private readonly storageKey = 'rubicData';

  /**
   * Is current app placed in iframe (In iframe localStorage using is not allow)
   */
  private get isIframe(): boolean {
    return this.iframeService.isIframe;
  }

  constructor(
    private readonly cookieService: CookieService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(LOCAL_STORAGE) private localStorage: Storage,
    private readonly iframeService: IframeService
  ) {
    const store = this.fetchData();
    this.storageSubject$ = new BehaviorSubject<Store>(store);
  }

  /**
   * Set some store data by key.
   * @param key Store object key.
   * @param value Value to store.
   */
  public setItem<T extends keyof Store>(key: T, value: Store[T]): void {
    const newData = {
      ...this.storageSubject$.value,
      [key]: value
    };
    try {
      const jsonData = JSON.stringify(newData);

      if (!this.isIframe) {
        this.localStorage?.setItem(this.storageKey, jsonData);
      } else {
        this.document.cookie = `${this.storageKey}=${jsonData}`;
      }
    } catch (err: unknown) {
      console.debug(err);
    } finally {
      this.storageSubject$.next(newData);
    }
  }

  /**
   * Get store item by key.
   * @param key Store key.
   */
  public getItem<T extends keyof Store>(key: T): Store[T] {
    return this.storageSubject$.value?.[key];
  }

  /**
   * Fetch stored data from local storage or cookies.
   */
  public fetchData(): Store {
    try {
      const cookie = this.cookieService.get(this.storageKey);
      const data = JSON.parse(
        this.isIframe && cookie ? cookie : this.localStorage?.getItem(this.storageKey)
      );
      return (data || {}) as Store;
    } catch (err: unknown) {
      console.debug(err);
      return {} as Store;
    }
  }

  /**
   * Delete stored data.
   */
  public deleteData(): void {
    try {
      if (!this.isIframe) {
        this.localStorage?.removeItem(this.storageKey);
      } else {
        this.cookieService.delete(this.storageKey);
      }
    } catch (err: unknown) {
      console.debug(err);
    } finally {
      this.storageSubject$.next(null);
    }
  }

  /**
   * Delete store item data by key.
   * @param key Store key.
   */
  public deleteItem(key: keyof Store): void {
    const newData: Store = {
      ...this.storageSubject$.value,
      [key]: undefined
    };
    try {
      const jsonData = JSON.stringify(newData);
      if (!this.isIframe) {
        this.localStorage?.setItem(this.storageKey, jsonData);
      } else {
        this.cookieService.set(this.storageKey, jsonData);
      }
    } catch (err: unknown) {
      console.debug(err);
    } finally {
      this.storageSubject$.next(newData);
    }
  }

  /**
   * Clear all data in user storage except
   * recent trades and unread trades if they exists.
   */
  public clearStorage(): void {
    const recentTrades = this.getItem('recentTrades');
    const unreadTrades = this.getItem('unreadTrades');

    try {
      if (!this.isIframe) {
        this.localStorage?.clear();

        if (recentTrades) {
          this.localStorage.setItem(
            this.storageKey,
            JSON.stringify({ recentTrades, unreadTrades })
          );
        }
      }
    } catch (err: unknown) {
      console.debug(err);
    } finally {
      if (recentTrades) {
        this.storageSubject$.next({ ...({} as Store), recentTrades, unreadTrades });
      } else {
        this.storageSubject$.next(null);
      }
    }
  }
}
