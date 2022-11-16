import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { FormControl } from '@ngneat/reactive-forms';
import { debounceTime, distinctUntilChanged, filter, skip, startWith } from 'rxjs/operators';
import { StoreService } from '@core/services/store/store.service';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { blockchainRequiresAddress } from '@features/swaps/shared/components/target-network-address/services/constants/blockchain-requires-address';
import { correctAddressValidator } from './utils/correct-address-validator';
import { isNil } from '@app/shared/utils/utils';
import { compareAddresses } from 'rubic-sdk';

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
  }

  private initSubscriptions(): void {
    this.addressForm.valueChanges.pipe(debounceTime(10), distinctUntilChanged()).subscribe(() => {
      if (this.addressForm.valid) {
        this.storeService.setItem('targetAddress', this.addressForm.value);
      }

      this._address$.next(this.addressForm.valid ? this.addressForm.value : null);
      this._isAddressValid$.next(this.addressForm.valid);
    });

    combineLatest([
      this.swapFormService.inputControls.fromToken.valueChanges,
      this.swapFormService.inputControls.toToken.valueChanges
    ])
      .pipe(
        startWith(null),
        filter(() => !Object.values(this.swapFormService.inputValue).some(value => isNil(value))),
        skip(1),
        distinctUntilChanged(([prevFromToken, prevToToken], [currFromToken, currToToken]) => {
          return (
            compareAddresses(prevFromToken.address, currFromToken.address) &&
            compareAddresses(prevToToken.address, currToToken.address) &&
            prevToToken.blockchain === currToToken.blockchain &&
            prevFromToken.blockchain === currToToken.blockchain
          );
        })
      )
      .subscribe(([fromToken, toToken]) => {
        const { blockchain: fromBlockchain } = fromToken;
        const { blockchain: toBlockchain } = toToken;

        this.addressForm.patchValue(null);
        this._address$.next(null);

        this._isAddressRequired$.next(
          fromBlockchain !== toBlockchain &&
            blockchainRequiresAddress.some(el => el === fromBlockchain || el === toBlockchain)
        );
        this.addressForm.clearValidators();
        this.addressForm.setValidators(correctAddressValidator(fromBlockchain, toBlockchain));

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
