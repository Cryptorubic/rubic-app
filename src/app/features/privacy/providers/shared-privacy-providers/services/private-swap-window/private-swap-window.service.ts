import { Injectable } from '@angular/core';
import { PrivateSwapInfo } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-info';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PrivateSwapWindowService {
  private readonly _swapInfo$ = new BehaviorSubject<PrivateSwapInfo>({
    fromAsset: null,
    fromAmount: null,
    toAsset: null,
    toAmount: null
  });

  public readonly swapInfo$ = this._swapInfo$.asObservable();

  public get swapInfo(): PrivateSwapInfo {
    return this._swapInfo$.value;
  }

  public patchSwapInfo(value: Partial<PrivateSwapInfo>): void {
    this._swapInfo$.next({ ...this.swapInfo, ...value });
  }
}
