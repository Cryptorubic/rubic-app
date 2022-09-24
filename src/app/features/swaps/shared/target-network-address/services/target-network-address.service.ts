import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Validators } from '@angular/forms';
import { FormControl } from '@ngneat/reactive-forms';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { StoreService } from '@core/services/store/store.service';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { correctAddressValidator } from '@features/swaps/shared/target-network-address/services/utils/correct-address-validator';
import { blockchainRequiresAddress } from '@features/swaps/shared/target-network-address/services/constants/blockchain-requires-address';

@Injectable()
export class TargetNetworkAddressService {
  public readonly addressForm = new FormControl<string>(null, [Validators.required]);

  private readonly _address$ = new BehaviorSubject<string | null>(null);

  public readonly address$ = this._address$.asObservable();

  public get address(): string | null {
    return this._address$.value;
  }

  private readonly _isAddressRequired$ = new BehaviorSubject<boolean>(false);

  public readonly isAddressRequired$ = this._isAddressRequired$.asObservable();

  private readonly _isAddressValid$ = new BehaviorSubject<boolean>(true);

  public readonly isAddressValid$ = this._isAddressValid$.asObservable();

  constructor(
    private readonly storeService: StoreService,
    private readonly swapFormService: SwapFormService
  ) {
    this.initSubscriptions();
    this.setupTargetAddress();
  }

  private initSubscriptions(): void {
    this.addressForm.valueChanges.pipe(debounceTime(10), distinctUntilChanged()).subscribe(() => {
      this._isAddressValid$.next(this.addressForm.valid);

      if (this.addressForm.valid) {
        this.storeService.setItem('targetAddress', this.addressForm.value);
      }

      this._address$.next(this.addressForm.valid ? this.addressForm.value : null);
    });

    this.swapFormService.input.controls.toBlockchain.valueChanges
      .pipe(startWith(this.swapFormService.inputValue.toBlockchain))
      .subscribe(toBlockchain => {
        this._isAddressRequired$.next(blockchainRequiresAddress.some(el => el === toBlockchain));

        this.addressForm.clearValidators();
        this.addressForm.setValidators(Validators.required);
        this.addressForm.setValidators(correctAddressValidator(toBlockchain));
      });
  }

  private setupTargetAddress(): void {
    const targetAddress = this.storeService.getItem('targetAddress');
    if (typeof targetAddress === 'string') {
      this.addressForm.patchValue(targetAddress);
    }
  }
}
