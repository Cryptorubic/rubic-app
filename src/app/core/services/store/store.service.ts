import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { DOCUMENT } from '@angular/common';
import { LOCAL_STORAGE } from '@ng-web-apis/common';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { WALLET_NAME } from '../../wallets/components/wallets-modal/models/providers';

interface Store {
  unreadTrades: number;
  provider: WALLET_NAME;
  settings: unknown;
  theme: 'dark' | 'light';
  chainId: number;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private readonly $dataSubject: BehaviorSubject<Store>;

  private readonly storageKey = 'rubicData';

  public get $data(): Observable<Store> {
    return this.$dataSubject.asObservable();
  }

  public isIframe: boolean;

  constructor(
    private readonly cookieService: CookieService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(LOCAL_STORAGE) private localStorage: Storage,
    private readonly iframeService: IframeService
  ) {
    this.$dataSubject = new BehaviorSubject<Store>(null);
  }

  public setData(data: Partial<Store>): void {
    const newData = {
      ...this.$dataSubject.value,
      ...data
    };
    const jsonData = JSON.stringify(newData);
    if (!this.isIframe) {
      this.localStorage?.setItem(this.storageKey, jsonData);
    } else {
      this.document.cookie = `${this.storageKey}=${jsonData}`;
    }
    this.$dataSubject.next(newData);
  }

  public setItem<T extends keyof Store>(key: T, value: Store[T]): void {
    const newData = {
      ...this.$dataSubject.value,
      [key]: value
    };

    const jsonData = JSON.stringify(newData);

    if (!this.isIframe) {
      this.localStorage?.setItem(this.storageKey, jsonData);
    } else {
      this.document.cookie = `${this.storageKey}=${jsonData}`;
    }
    this.$dataSubject.next(newData);
  }

  public getItem<T extends keyof Store>(key: T): Store[T] {
    return this.$dataSubject.value?.[key];
  }

  public fetchData(isIframe: boolean): void {
    this.isIframe = isIframe;
    const cookie = this.cookieService.get(this.storageKey);
    const data = JSON.parse(
      this.isIframe && cookie ? cookie : this.localStorage?.getItem(this.storageKey)
    );
    this.$dataSubject.next(data || {});
  }

  public deleteData(): void {
    if (!this.isIframe) {
      this.localStorage?.removeItem(this.storageKey);
    } else {
      this.cookieService.delete(this.storageKey);
    }
    this.$dataSubject.next(null);
  }

  public deleteItem(key: keyof Store): void {
    const newData = {
      ...this.$dataSubject.value,
      [key]: undefined
    };
    const jsonData = JSON.stringify(newData);
    if (!this.isIframe) {
      this.localStorage?.setItem(this.storageKey, jsonData);
    } else {
      this.cookieService.set(this.storageKey, jsonData);
    }
    this.$dataSubject.next(newData);
  }

  public clearStorage(): void {
    if (!this.isIframe) {
      this.localStorage?.clear();
    }
    this.$dataSubject.next(null);
  }
}
