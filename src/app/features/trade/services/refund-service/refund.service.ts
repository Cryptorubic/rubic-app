import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { Any } from 'rubic-sdk';
import { BehaviorSubject, combineLatest, Observable, switchMap, takeUntil, tap } from 'rxjs';
import { getCorrectAddressValidator } from '../../components/target-network-address/utils/get-correct-address-validator';
import { SwapFormInput } from '../../models/swap-form-controls';

type RefundObserverAction = 'inputValueChanged';

export interface RefundObserver {
  obs$: Observable<Any>;
  action: RefundObserverAction;
  callback?: (...args: unknown[]) => void;
}

@Injectable()
export class RefundService {
  private readonly actions: Record<RefundObserverAction, (emittedValue: unknown) => void> = {
    inputValueChanged: this.onSwapFormInputChanged
  };

  private readonly _observers$ = new BehaviorSubject<RefundObserver[]>([]);

  public readonly refundAddressCtrl = new FormControl<string>('', {
    asyncValidators: []
  });

  public get refundAddress(): string {
    return this.refundAddressCtrl.value;
  }

  constructor(private readonly destroy$: TuiDestroyService) {
    this._observers$
      .pipe(
        switchMap((observers: RefundObserver[]) =>
          combineLatest([
            ...observers.map(obs =>
              obs.obs$.pipe(
                tap((val: Any) => {
                  obs.callback?.(val);
                  this.actions[obs.action].call(this, val);
                }),
                takeUntil(this.destroy$)
              )
            )
          ])
        ),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public addObserver(observer: RefundObserver): void {
    this._observers$.next([...this._observers$.value, observer]);
  }

  public setRefundAddress(value: string): void {
    this.refundAddressCtrl.setValue(value);
  }

  private onSwapFormInputChanged(input: SwapFormInput): void {
    this.refundAddressCtrl.clearAsyncValidators();
    this.refundAddressCtrl.setAsyncValidators(
      getCorrectAddressValidator({
        fromAssetType: input.fromBlockchain,
        toBlockchain: input.toBlockchain
      })
    );
    this.refundAddressCtrl.updateValueAndValidity();
  }
}
