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
  private readonly storageSubject: BehaviorSubject<Store>;

  /**
   * Key to store data.
   * @private
   */
  private readonly storageKey = 'rubicData';

  /**
   * Is current app placed in iframe (In iframe localStorage using is not allow)
   */
  public isIframe: boolean;

  constructor(
    private readonly cookieService: CookieService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(LOCAL_STORAGE) private localStorage: Storage,
    private readonly iframeService: IframeService
  ) {
    this.isIframe = iframeService.isIframe;
    this.storageSubject = new BehaviorSubject<Store>(null);
  }

  /**
   * @description Set whole store data.
   * @param data Store data.
   */
  public setData(data: Partial<Store>): void {
    const newData = {
      ...this.storageSubject.value,
      ...data
    };
    const jsonData = JSON.stringify(newData);
    if (!this.isIframe) {
      this.localStorage?.setItem(this.storageKey, jsonData);
    } else {
      this.document.cookie = `${this.storageKey}=${jsonData}`;
    }
    this.storageSubject.next(newData);
  }

  /**
   * @description Add some data to store collection.
   * @param key Store object key.
   * @param value Value to store.
   */
  public addCollectionItem<T extends keyof Store>(key: T, value: Store[T]): void {
    const hasKey = Boolean(this.storageSubject.value[key]);
    const newCollection = [
      ...(hasKey ? [...(this.storageSubject.value[key] as [])] : []),
      ...(value as [])
    ] as Store[T];

    this.setItem(key, newCollection);
  }

  /**
   * @description Set some store data by key.
   * @param key Store object key.
   * @param value Value to store.
   */
  public setItem<T extends keyof Store>(key: T, value: Store[T]): void {
    const newData = {
      ...this.storageSubject.value,
      [key]: value
    };

    const jsonData = JSON.stringify(newData);

    if (!this.isIframe) {
      this.localStorage?.setItem(this.storageKey, jsonData);
    } else {
      this.document.cookie = `${this.storageKey}=${jsonData}`;
    }
    this.storageSubject.next(newData);
  }

  /**
   * @description Get store item by key.
   * @param key Store key.
   */
  public getItem<T extends keyof Store>(key: T): Store[T] {
    return this.storageSubject.value?.[key];
  }

  /**
   * Fetch stored data from local storage or cookies.
   * @param isIframe Fetch data from cookies if its the iframe.
   */
  public fetchData(isIframe: boolean): void {
    this.isIframe = isIframe;
    const cookie = this.cookieService.get(this.storageKey);
    const data = JSON.parse(
      this.isIframe && cookie ? cookie : this.localStorage?.getItem(this.storageKey)
    );
    this.storageSubject.next(data || {});
  }

  /**
   * @description Delete stored data.
   */
  public deleteData(): void {
    if (!this.isIframe) {
      this.localStorage?.removeItem(this.storageKey);
    } else {
      this.cookieService.delete(this.storageKey);
    }
    this.storageSubject.next(null);
  }

  /**
   * @description Delete store item data by key.
   * @param key Store key.
   */
  public deleteItem(key: keyof Store): void {
    const newData: Store = {
      ...this.storageSubject.value,
      [key]: undefined
    };
    const jsonData = JSON.stringify(newData);
    if (!this.isIframe) {
      this.localStorage?.setItem(this.storageKey, jsonData);
    } else {
      this.cookieService.set(this.storageKey, jsonData);
    }
    this.storageSubject.next(newData);
  }

  /**
   * @description Clear all data in user storage.
   */
  public clearStorage(): void {
    if (!this.isIframe) {
      this.localStorage?.clear();
    }
    this.storageSubject.next(null);
  }

  /**
   * @description Set some store collection data by key.
   * @param key Store key.
   * @param compareFn Function to filter collection values.
   */
  public setCollectionItem(key: keyof Store, compareFn: (el: unknown) => boolean) {
    const newCollection = (this.storageSubject.value[key] as []).filter(compareFn);
    this.setItem(key, newCollection);
  }
}
