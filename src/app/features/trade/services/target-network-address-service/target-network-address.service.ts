import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  skip,
  startWith,
  tap
} from 'rxjs';
import { BlockchainsInfo, ChainType } from '@cryptorubic/core';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { FormControl } from '@angular/forms';
import { getCorrectAddressValidator } from '../../components/target-network-address/utils/get-correct-address-validator';
import { FormsTogglerService } from '@features/trade/services/forms-toggler/forms-toggler.service';

@Injectable()
export class TargetNetworkAddressService {
  public readonly addressControl = new FormControl<string>('', { nonNullable: true });

  public readonly address$ = this.addressControl.valueChanges.pipe(
    tap(() => this.addressControl.clearAsyncValidators()),
    startWith(this.addressControl.value),
    debounceTime(100),
    distinctUntilChanged(),
    tap(() => this.setCorrectAddressValidator())
  );

  public get address(): string {
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
    private readonly formsTogglerService: FormsTogglerService
  ) {
    this.setCorrectAddressValidator();
    this.watchIsAddressRequired();
    this.subscribeOnFormValueChanges();
  }

  private watchIsAddressRequired(): void {
    combineLatest([
      this.swapFormService.fromBlockchain$,
      this.swapFormService.toBlockchain$,
      this.formsTogglerService.isTransferMode$
    ]).subscribe(([from, to, isTransferMode]) => {
      if (isTransferMode) {
        this._isAddressRequired$.next(!!from);
        return;
      }

      const fromChainType: ChainType | null = from ? BlockchainsInfo.getChainType(from) : null;
      const toChainType: ChainType | null = to ? BlockchainsInfo.getChainType(to) : null;
      const isAddressRequired = fromChainType && toChainType && fromChainType !== toChainType;
      this._isAddressRequired$.next(!!isAddressRequired);
    });
  }

  private subscribeOnFormValueChanges(): void {
    this.swapFormService.inputValue$.pipe(skip(1)).subscribe(() => {
      this.setCorrectAddressValidator();
    });

    this.formsTogglerService.isTransferMode$.pipe(skip(1)).subscribe(() => {
      this.setCorrectAddressValidator();
    });
  }

  private setCorrectAddressValidator(): void {
    const input = this.swapFormService.inputValue;
    const validatedChain = this.formsTogglerService.isTransferMode
      ? input.fromBlockchain
      : input.toBlockchain;

    this.addressControl.setAsyncValidators(
      getCorrectAddressValidator({
        fromAssetType: input.fromBlockchain,
        validatedChain
      })
    );
    this.addressControl.updateValueAndValidity({
      emitEvent: !this.addressControl.disabled
    });
  }

  public setFormControlDisabled(disabled: boolean): void {
    if (disabled) {
      this.addressControl.disable({ emitEvent: false });
    } else {
      this.addressControl.enable({ emitEvent: false });
    }
  }
}
