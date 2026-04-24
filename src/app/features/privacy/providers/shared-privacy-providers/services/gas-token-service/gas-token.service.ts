import { Injectable } from '@angular/core';
import { GasToken } from '@app/shared/models/tokens/gas-token';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PrivateGasTokenService {
  private readonly _selectedGasToken$ = new BehaviorSubject<GasToken | null>(null);

  public get selectedGasToken(): GasToken | null {
    return this._selectedGasToken$.value;
  }

  public selectGasToken(token: GasToken | null): void {
    this._selectedGasToken$.next(token);
  }
}
