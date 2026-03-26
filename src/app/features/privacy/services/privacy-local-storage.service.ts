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
    ALREADY_SHIELDED: Object.values(PRIVATE_TRADE_TYPE).reduce(
      (acc, privateTradeType) => ({ ...acc, [privateTradeType]: true }),
      {} as PrivacyLocalStorage['ALREADY_SHIELDED']
    )
  });

  public readonly storage$ = this._storage$.pipe(shareReplay({ bufferSize: 1, refCount: false }));

  public alreadyMadeShielding$(providerType: PrivateTradeType): Observable<boolean> {
    return this.storage$.pipe(map(storage => storage.ALREADY_SHIELDED[providerType]));
  }

  constructor(
    private readonly storeService: StoreService,
    @Inject(WINDOW) private window: RubicWindow
  ) {}

  public initStorage(): void {
    // this.window.addEventListener('beforeunload', () => {
    //   this.storeService.setItem('ALREADY_SHIELDED', { ...this._storage$.value.ALREADY_SHIELDED });
    // });
    // const info = this.storeService.getItem('ALREADY_SHIELDED');
    // if (!info) return;
    // this._storage$.next({ ...this._storage$.value, ALREADY_SHIELDED: { ...info } });
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
