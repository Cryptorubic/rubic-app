import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { blockchainRequiresAddress } from '@features/swaps/shared/components/target-network-address/services/constants/blockchain-requires-address';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';

@Injectable()
export class TargetNetworkAddressService {
  private readonly _address$ = new BehaviorSubject<string | null>(null);

  public readonly address$ = this._address$.asObservable();

  public get address(): string | null {
    return this._address$.getValue();
  }

  public readonly isAddressRequired$ = this.swapFormService.inputValueChanges.pipe(
    distinctUntilChanged(
      (prev, curr) =>
        prev.fromBlockchain !== curr.fromBlockchain || prev.toBlockchain !== curr.toBlockchain
    ),
    map(
      ({ fromBlockchain, toBlockchain }) =>
        fromBlockchain !== toBlockchain &&
        blockchainRequiresAddress.some(
          blockchain => blockchain === fromBlockchain || blockchain === toBlockchain
        )
    ),
    startWith(false)
  );

  private readonly _isAddressValid$ = new BehaviorSubject<boolean>(true);

  public readonly isAddressValid$ = this._isAddressValid$.asObservable();

  constructor(private readonly swapFormService: SwapFormService) {}

  public setAddress(value: string): void {
    this._address$.next(value);
  }

  public setIsAddressValid(value: boolean): void {
    this._isAddressValid$.next(value);
  }
}
