import { Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { Any } from 'rubic-sdk';
import { BehaviorSubject, combineLatest, Observable, switchMap, takeUntil, tap } from 'rxjs';
import { getCorrectAddressValidator } from '../../components/target-network-address/utils/get-correct-address-validator';
import { SwapFormInput } from '../../models/swap-form-controls';

type RefundObserverAction = 'fromBlockchainChanged';

export interface RefundObserver {
  obs$: Observable<Any>;
  action: RefundObserverAction;
  callback?: <T>(...args: unknown[]) => T;
}

@Injectable()
export class RefundService {
  private readonly actions: Record<RefundObserverAction, (emittedValue: unknown) => void> = {
    fromBlockchainChanged: this.onFromBlockchainChanged.bind(this)
  };

  private readonly _observers$ = new BehaviorSubject<RefundObserver[]>([]);

  public readonly refundAddressCtrl = new FormControl<string>('', {
    validators: [Validators.required],
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

  private onFromBlockchainChanged(input: SwapFormInput): void {
    // this.refundAddressCtrl.clearAsyncValidators();
    this.refundAddressCtrl.removeAsyncValidators(
      getCorrectAddressValidator({
        fromAssetType: input.fromBlockchain,
        toBlockchain: input.toBlockchain
      })
    );
    this.refundAddressCtrl.setAsyncValidators(
      getCorrectAddressValidator({
        fromAssetType: input.fromBlockchain,
        toBlockchain: input.toBlockchain
      })
    );
    this.refundAddressCtrl.updateValueAndValidity();
  }
}
