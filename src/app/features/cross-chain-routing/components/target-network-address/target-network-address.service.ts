import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { SwapFormService } from '@features/swaps/services/swaps-form-service/swap-form.service';
import { map } from 'rxjs/operators';

interface TargetAddress {
  value: string;
  isValid: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TargetNetworkAddressService {
  private readonly networksRequiresAddress = [BLOCKCHAIN_NAME.SOLANA];

  private readonly _targetNetworkAddress$ = new BehaviorSubject<TargetAddress | null>(null);

  public readonly targetAddress$ = this._targetNetworkAddress$.asObservable();

  public readonly displayAddress$: Observable<boolean>;

  constructor(private readonly formService: SwapFormService) {
    this.displayAddress$ = this.formService.input.valueChanges.pipe(
      map(form => {
        console.log(formService.inputValue);
        return (
          this.networksRequiresAddress.includes(form.fromBlockchain) ||
          this.networksRequiresAddress.includes(form.toBlockchain)
        );
      })
    );
  }

  public getTargetAddress(): TargetAddress {
    return this._targetNetworkAddress$.value;
  }

  public setTargetAddress(targetAddress: TargetAddress): void {
    this._targetNetworkAddress$.next(targetAddress);
  }
}
