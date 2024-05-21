import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  skip,
  tap
} from 'rxjs';
import { BlockchainsInfo, ChainType } from 'rubic-sdk';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { FormControl } from '@angular/forms';
import { getCorrectAddressValidator } from '../../components/target-network-address/utils/get-correct-address-validator';
import { StoreService } from '@core/services/store/store.service';

@Injectable()
export class TargetNetworkAddressService {
  public readonly addressControl = new FormControl<string>('');

  public readonly address$ = this.addressControl.valueChanges.pipe(
    tap(() => this.addressControl.clearAsyncValidators()),
    debounceTime(100),
    distinctUntilChanged(),
    tap(address => {
      this.setCorrectAddressValidator();

      if (address) {
        this.store.setItem('RUBIC_TARGET_ADDRESS', address);
      }
    })
  );

  public get address(): string | null {
    return this.addressControl.value;
  }

  private readonly _isAddressRequired$ = new BehaviorSubject<boolean>(false);

  public readonly isAddressRequired$ = this._isAddressRequired$.asObservable();

  public readonly isAddressValid$ = this.addressControl.statusChanges.pipe(
    debounceTime(100),
    distinctUntilChanged(),
    map(status => status === 'VALID')
  );

  constructor(
    private readonly swapFormService: SwapsFormService,
    private readonly store: StoreService
  ) {
    this.setCorrectAddressValidator();
    this.watchIsAddressRequired();
    this.subscribeOnFormValueChanges();
  }

  private watchIsAddressRequired(): void {
    combineLatest([
      this.swapFormService.fromBlockchain$,
      this.swapFormService.toBlockchain$
    ]).subscribe(([from, to]) => {
      let fromChainType: ChainType | undefined;
      try {
        fromChainType = BlockchainsInfo.getChainType(from);
      } catch {}
      let toChainType: ChainType | undefined;
      try {
        toChainType = BlockchainsInfo.getChainType(to);
      } catch {}
      const isAddressRequired =
        from && to && from !== to && (!toChainType || fromChainType !== toChainType);
      this._isAddressRequired$.next(isAddressRequired);
    });
  }

  private subscribeOnFormValueChanges(): void {
    this.swapFormService.inputValue$.pipe(skip(1)).subscribe(() => {
      this.setCorrectAddressValidator();
    });
  }

  private setCorrectAddressValidator(): void {
    const input = this.swapFormService.inputValue;
    this.addressControl.setAsyncValidators(
      getCorrectAddressValidator({
        fromAssetType: input.fromBlockchain,
        toBlockchain: input.toBlockchain
      })
    );
    this.addressControl.updateValueAndValidity();
  }

  public clearReceiverAddress(): void {
    this.addressControl.setValue(null);
  }
}
