import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WALLET_NAME } from '../../header/components/header/components/wallets-modal/models/providers';

interface Store {
  provider: WALLET_NAME;
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

  constructor() {
    this.storageKey = 'rubicData';
    this.$dataSubject = new BehaviorSubject<Store>(null);
    this.fetchData();
  }

  public setData(data: Partial<Store>): void {
    const newData = {
      ...this.$dataSubject.value,
      ...data
    };
    const jsonData = JSON.stringify(newData);
    localStorage.setItem(this.storageKey, jsonData);
    this.$dataSubject.next(newData);
  }

  public setItem(key: keyof Store, value: any): void {
    const newData = {
      ...this.$dataSubject.value,
      [key]: value
    };
    const jsonData = JSON.stringify(newData);
    localStorage.setItem(this.storageKey, jsonData);
    this.$dataSubject.next(newData);
  }

  public getItem(key: keyof Store): any {
    return this.$dataSubject?.value[key];
  }

  public fetchData(): void {
    const data = JSON.parse(localStorage.getItem(this.storageKey));
    this.$dataSubject.next(data || {});
  }

  public deleteData(): void {
    localStorage.removeItem(this.storageKey);
    this.$dataSubject.next(null);
  }

  public deleteItem(key: keyof Store): void {
    const newData = {
      ...this.$dataSubject.value,
      [key]: undefined
    };
    const jsonData = JSON.stringify(newData);
    localStorage.setItem(this.storageKey, jsonData);
    this.$dataSubject.next(newData);
  }

  public clearStorage(): void {
    localStorage.clear();
    this.$dataSubject.next(null);
  }
}
