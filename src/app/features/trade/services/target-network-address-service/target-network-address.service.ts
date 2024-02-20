import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { BlockchainsInfo, ChainType } from 'rubic-sdk';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';

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

  constructor(private readonly swapFormService: SwapsFormService) {
    this.watchIsAddressRequired();
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

  public setAddress(value: string): void {
    this._address$.next(value);
  }

  public setIsAddressValid(value: boolean): void {
    this._isAddressValid$.next(value);
  }
}
