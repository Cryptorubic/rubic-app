import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { DOCUMENT } from '@angular/common';
import { WALLET_NAME } from '../../header/components/header/components/wallets-modal/models/providers';

interface Store {
  provider: WALLET_NAME;
  settings: unknown;
  theme: 'dark' | 'light';
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private readonly $dataSubject: BehaviorSubject<Store>;

  private readonly storageKey: string;

  public get $data(): Observable<Store> {
    return this.$dataSubject.asObservable();
  }

  public isIframe: boolean;

  constructor(
    private readonly cookieService: CookieService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.storageKey = 'rubicData';
    this.$dataSubject = new BehaviorSubject<Store>(null);
  }

  public setData(data: Partial<Store>): void {
    const newData = {
      ...this.$dataSubject.value,
      ...data
    };
    const jsonData = JSON.stringify(newData);
    if (!this.isIframe) {
      localStorage.setItem(this.storageKey, jsonData);
    } else {
      this.document.cookie = `${this.storageKey}=${jsonData}`;
    }
    this.$dataSubject.next(newData);
  }

  public setItem(key: keyof Store, value: unknown): void {
    const newData = {
      ...this.$dataSubject.value,
      [key]: value
    };
    const jsonData = JSON.stringify(newData);
    if (!this.isIframe) {
      localStorage.setItem(this.storageKey, jsonData);
    } else {
      this.document.cookie = `${this.storageKey}=${jsonData}`;
    }
    this.$dataSubject.next(newData);
  }

  public getItem(key: keyof Store): unknown {
    return this.$dataSubject.value?.[key];
  }

  public fetchData(isIframe: boolean): void {
    this.isIframe = isIframe;
    const cookie = this.cookieService.get(this.storageKey);
    const data = JSON.parse(
      this.isIframe && cookie ? cookie : localStorage.getItem(this.storageKey)
    );
    this.$dataSubject.next(data || {});
  }

  public deleteData(): void {
    if (!this.isIframe) {
      localStorage.removeItem(this.storageKey);
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
      localStorage.setItem(this.storageKey, jsonData);
    } else {
      this.cookieService.set(this.storageKey, jsonData);
    }
    this.$dataSubject.next(newData);
  }

  public clearStorage(): void {
    localStorage.clear();
    this.$dataSubject.next(null);
  }
}
