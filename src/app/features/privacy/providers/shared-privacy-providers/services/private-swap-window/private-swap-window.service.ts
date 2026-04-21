import { Injectable } from '@angular/core';
import { PrivateSwapInfo } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-info';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
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

  private readonly _selectedGasToken$ = new BehaviorSubject<BalanceToken | null>(null);

  public readonly selectedGasToken$ = this._selectedGasToken$.asObservable();

  public get swapInfo(): PrivateSwapInfo {
    return this._swapInfo$.value;
  }

  public patchSwapInfo(value: Partial<PrivateSwapInfo>): void {
    this._swapInfo$.next({ ...this.swapInfo, ...value });
  }

  public selectGasToken(token: BalanceToken | null): void {
    this._selectedGasToken$.next(token);
  }
}
