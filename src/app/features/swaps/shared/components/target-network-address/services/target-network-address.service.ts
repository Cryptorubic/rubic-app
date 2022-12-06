import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { SwapsFormService } from '@features/swaps/core/services/swaps-form-service/swaps-form.service';
import { blockchainRequiresAddress } from '@features/swaps/shared/components/target-network-address/services/constants/blockchain-requires-address';

@Injectable()
export class TargetNetworkAddressService {
  private readonly _address$ = new BehaviorSubject<string | null>(null);

  public readonly address$ = this._address$.asObservable();

  public get address(): string | null {
    return this._address$.getValue();
  }

  private readonly _isAddressRequired$ = new BehaviorSubject<boolean>(false);

  public readonly isAddressRequired$ = this._isAddressRequired$.asObservable();

  private readonly _isAddressValid$ = new BehaviorSubject<boolean>(true);

  public readonly isAddressValid$ = this._isAddressValid$.asObservable();

  constructor(private readonly swapsFormService: SwapsFormService) {
    this.watchIsAddressRequired();
  }

  private watchIsAddressRequired(): void {
    combineLatest([
      this.swapsFormService.fromBlockchain$,
      this.swapsFormService.toBlockchain$
    ]).subscribe(([from, to]) => {
      const isAddressRequired =
        from &&
        from !== to &&
        blockchainRequiresAddress.some(blockchain => blockchain === from || blockchain === to);
      this._isAddressRequired$.next(isAddressRequired);
    });
  }

  public setAddress(value: string): void {
    this._address$.next(value);
  }

  public setIsAddressValid(value: boolean): void {
    this._isAddressValid$.next(value);
  }
}
