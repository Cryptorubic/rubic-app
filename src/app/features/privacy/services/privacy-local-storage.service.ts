import { Inject, Injectable } from '@angular/core';
import { PrivacyLocalStorage } from './models/privacy-local-storage';
import { PRIVATE_TRADE_TYPE, PrivateTradeType } from '../constants/private-trade-types';
import { BehaviorSubject, Observable, map, shareReplay } from 'rxjs';
import { StoreService } from '@app/core/services/store/store.service';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@app/shared/utils/rubic-window';

@Injectable()
export class PrivateLocalStorageService {
  private readonly _storage$ = new BehaviorSubject<PrivacyLocalStorage>({
    SHIELDING_STATUS: Object.values(PRIVATE_TRADE_TYPE).reduce(
      (acc, privateTradeType) => ({ ...acc, [privateTradeType]: false }),
      {} as PrivacyLocalStorage['SHIELDING_STATUS']
    )
  });

  public readonly storage$ = this._storage$.pipe(shareReplay({ bufferSize: 1, refCount: false }));

  public alreadyMadeShielding$(providerType: PrivateTradeType): Observable<boolean> {
    return this.storage$.pipe(map(storage => storage.SHIELDING_STATUS[providerType]));
  }

  constructor(
    private readonly storeService: StoreService,
    @Inject(WINDOW) private window: RubicWindow
  ) {}

  public initStorage(): void {
    this.window.addEventListener('beforeunload', () => {
      this.storeService.setItem('SHIELDING_STATUS', { ...this._storage$.value.SHIELDING_STATUS });
    });

    const info = this.storeService.getItem('SHIELDING_STATUS');
    if (!info) return;
    this._storage$.next({ ...this._storage$.value, SHIELDING_STATUS: { ...info } });
  }

  public markProviderAsShielded(providerType: PrivateTradeType): void {
    const alreadyMarked = this._storage$.value.SHIELDING_STATUS[providerType];
    if (alreadyMarked) return;
    this._storage$.next({
      ...this._storage$.value,
      SHIELDING_STATUS: {
        ...this._storage$.value.SHIELDING_STATUS,
        [providerType]: true
      }
    });
  }
}
