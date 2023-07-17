import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StoreService } from 'src/app/core/services/store/store.service';

@Injectable({
  providedIn: 'root'
})
export class TestnetService {
  private readonly _enableTestnets$ = new BehaviorSubject<boolean>(
    this.store.getItem('RUBIC_ENABLE_TESTNET') || false
  );

  public readonly enableTestnets$ = this._enableTestnets$.asObservable();

  public get enableTestnets(): boolean {
    return this._enableTestnets$.value;
  }

  constructor(private readonly store: StoreService) {}

  public switchTestnetState(): void {
    const newState = !this.enableTestnets;
    this._enableTestnets$.next(newState);
    this.store.setItem('RUBIC_ENABLE_TESTNET', newState);
  }
}
