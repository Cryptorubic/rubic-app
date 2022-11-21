import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormControl } from '@ngneat/reactive-forms';
import { debounceTime, distinctUntilChanged, filter, startWith } from 'rxjs/operators';
import { StoreService } from '@core/services/store/store.service';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { correctAddressValidator } from '@features/swaps/shared/components/target-network-address/services/utils/correct-address-validator';
import { blockchainRequiresAddress } from '@features/swaps/shared/components/target-network-address/services/constants/blockchain-requires-address';

@Injectable()
export class TargetNetworkAddressService {
  public readonly addressForm = new FormControl<string>(null);

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
      if (this.addressForm.valid) {
        this.storeService.setItem('targetAddress', this.addressForm.value);
      }

      this._address$.next(this.addressForm.valid ? this.addressForm.value : null);
      this._isAddressValid$.next(this.addressForm.valid);
    });

    this.swapFormService.inputValueChanges
      .pipe(
        startWith(this.swapFormService.inputValue),
        distinctUntilChanged(
          (prev, cur) =>
            prev.fromBlockchain === cur.fromBlockchain && prev.toBlockchain === cur.toBlockchain
        ),
        filter(form => form.fromBlockchain !== null)
      )
      .subscribe(form => {
        const { fromBlockchain, toBlockchain } = form;

        this._isAddressRequired$.next(
          fromBlockchain !== toBlockchain &&
            blockchainRequiresAddress.some(el => el === fromBlockchain || el === toBlockchain)
        );

        this.addressForm.clearValidators();
        this.addressForm.setValidators(correctAddressValidator(fromBlockchain, toBlockchain));

        this._address$.next(this.addressForm.valid ? this.addressForm.value : null);
        this._isAddressValid$.next(this.addressForm.valid);
      });
  }

  private setupTargetAddress(): void {
    const targetAddress = this.storeService.getItem('targetAddress');
    if (typeof targetAddress === 'string') {
      this.addressForm.patchValue(targetAddress);
    }
  }
}
