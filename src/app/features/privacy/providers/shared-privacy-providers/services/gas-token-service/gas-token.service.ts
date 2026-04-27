import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PrivateGasTokenService {
  private readonly DEFAULT_FEE_TOKEN = '0x0000000000000000000000000000000000000000';

  private readonly _selectedGasToken$ = new BehaviorSubject<string>(this.DEFAULT_FEE_TOKEN);

  public readonly selectedGasToken$ = this._selectedGasToken$.asObservable();

  public get selectedGasToken(): string {
    return this._selectedGasToken$.value;
  }

  public selectGasToken(token: string): void {
    this._selectedGasToken$.next(token);
  }
}
