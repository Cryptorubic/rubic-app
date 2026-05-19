import { Injectable } from '@angular/core';
import { PrivacyLocalStorage } from './models/privacy-local-storage';
import { PRIVATE_TRADE_TYPE, PrivateTradeType } from '../constants/private-trade-types';
import { BehaviorSubject, Observable, firstValueFrom, map, shareReplay } from 'rxjs';
import { StoreService } from '@app/core/services/store/store.service';
import { HttpService } from '@app/core/services/http/http.service';

@Injectable({ providedIn: 'root' })
export class PrivateLocalStorageService {
  private readonly _storage$ = new BehaviorSubject<PrivacyLocalStorage>({
    ALREADY_SHIELDED: Object.values(PRIVATE_TRADE_TYPE).reduce(
      (acc, privateTradeType) => ({ ...acc, [privateTradeType]: true }),
      {} as PrivacyLocalStorage['ALREADY_SHIELDED']
    ),
    FIRST_TIME_PRIVACY: true,
    PRIVACY_REF_CODE: null
  });

  public readonly storage$ = this._storage$.pipe(shareReplay({ bufferSize: 1, refCount: false }));

  public get refCode(): string {
    return this._storage$.value.PRIVACY_REF_CODE ?? '';
  }

  public alreadyMadeShielding$(providerType: PrivateTradeType): Observable<boolean> {
    return this.storage$.pipe(map(storage => storage.ALREADY_SHIELDED[providerType]));
  }

  public alreadyAuthorized$(): Observable<boolean> {
    return this.storage$.pipe(map(storage => !!storage.PRIVACY_REF_CODE));
  }

  constructor(
    private readonly storeService: StoreService,
    private readonly httpService: HttpService
  ) {}

  public async initStorage(): Promise<void> {
    const notAuthorized = Boolean(this.storeService.getItem('FIRST_TIME_PRIVACY') ?? true);
    const refCode = this.storeService.getItem('PRIVACY_REF_CODE') ?? null;

    if (refCode) {
      const { is_valid } = await firstValueFrom(
        this.httpService.get<{ is_valid: boolean }>(
          'v3/tmp/referrers/check_code',
          {
            code: refCode
          },
          '',
          { timeoutMs: 5_000 }
        )
      );
      this.patchStorageState({
        FIRST_TIME_PRIVACY: notAuthorized,
        PRIVACY_REF_CODE: is_valid ? refCode : null
      });
    } else {
      this.patchStorageState({
        FIRST_TIME_PRIVACY: notAuthorized,
        PRIVACY_REF_CODE: null
      });
    }
  }

  /**
   * Update app in-memory state of privacy-hub local storage
   */
  public patchStorageState(partialStorageState: Partial<PrivacyLocalStorage>): void {
    this._storage$.next({
      ...this._storage$.value,
      ...partialStorageState
    });
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
