import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  defer,
  map,
  shareReplay,
  startWith,
  switchMap
} from 'rxjs';
import { BlockchainsInfo, ChainType } from '@cryptorubic/core';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { FormControl } from '@angular/forms';
import { FormsTogglerService } from '@features/trade/services/forms-toggler/forms-toggler.service';
import { Web3Pure } from '@cryptorubic/web3';
import { shareReplayConfig } from '@shared/constants/common/share-replay-config';

@Injectable()
export class TargetNetworkAddressService {
  public readonly addressControl = new FormControl<string>('', { nonNullable: true });

  public readonly address$ = defer(() =>
    this.addressControl.valueChanges.pipe(startWith(this.addressControl.value))
  ).pipe(shareReplay(shareReplayConfig));

  public get address(): string {
    return this.addressControl.value;
  }

  private readonly _isAddressRequired$ = new BehaviorSubject<boolean>(false);

  public readonly isAddressRequired$ = this._isAddressRequired$.asObservable();

  public readonly isAddressValid$ = combineLatest([
    this.address$,
    this.swapFormService.toBlockchain$
  ]).pipe(
    debounceTime(100),
    switchMap(
      async ([address, toBlockchain]) =>
        address === '' ||
        (!!address && !!toBlockchain && (await Web3Pure.isAddressCorrect(toBlockchain, address)))
    ),
    shareReplay(shareReplayConfig)
  );

  public readonly isAddressSetAndValid$ = this.isAddressValid$.pipe(
    map(valid => valid && !!this.address)
  );

  constructor(
    private readonly swapFormService: SwapsFormService,
    private readonly formsTogglerService: FormsTogglerService
  ) {
    this.watchIsAddressRequired();
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

  public setFormControlDisabled(disabled: boolean): void {
    if (disabled) {
      this.addressControl.disable({ emitEvent: false });
    } else {
      this.addressControl.enable({ emitEvent: false });
    }
  }
}
