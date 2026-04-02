import { Injectable } from '@angular/core';
import { PrivacyLocalStorage } from './models/privacy-local-storage';
import { PRIVATE_TRADE_TYPE, PrivateTradeType } from '../constants/private-trade-types';
import { BehaviorSubject, Observable, map, shareReplay } from 'rxjs';
import { StoreService } from '@app/core/services/store/store.service';

@Injectable({ providedIn: 'root' })
export class PrivateLocalStorageService {
  private readonly _storage$ = new BehaviorSubject<PrivacyLocalStorage>({
    ALREADY_SHIELDED: Object.values(PRIVATE_TRADE_TYPE).reduce(
      (acc, privateTradeType) => ({ ...acc, [privateTradeType]: true }),
      {} as PrivacyLocalStorage['ALREADY_SHIELDED']
    ),
    FIRST_TIME_PRIVACY: true
  });

  public readonly storage$ = this._storage$.pipe(shareReplay({ bufferSize: 1, refCount: false }));

  public alreadyMadeShielding$(providerType: PrivateTradeType): Observable<boolean> {
    return this.storage$.pipe(map(storage => storage.ALREADY_SHIELDED[providerType]));
  }

  public alreadyAuthorized$(): Observable<boolean> {
    return this.storage$.pipe(map(storage => storage.FIRST_TIME_PRIVACY === false));
  }

  constructor(private readonly storeService: StoreService) {
    this.initStorage();
  }

  private initStorage(): void {
    const notAuthorized = this.storeService.getItem('FIRST_TIME_PRIVACY') ?? true;
    this._storage$.next({ ...this._storage$.value, FIRST_TIME_PRIVACY: notAuthorized });
  }

  public markProviderAsShielded(providerType: PrivateTradeType): void {
    const alreadyMarked = this._storage$.value.ALREADY_SHIELDED[providerType];
    if (alreadyMarked) return;
    this._storage$.next({
      ...this._storage$.value,
      ALREADY_SHIELDED: {
        ...this._storage$.value.ALREADY_SHIELDED,
        [providerType]: true
      }
    });
  }
}
