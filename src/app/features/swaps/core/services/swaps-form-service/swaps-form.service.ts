import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { observableToBehaviorSubject } from '@shared/utils/observableToBehaviorSubject';
import { FormControl, FormGroup } from '@angular/forms';
import {
  SwapForm,
  SwapFormInput,
  SwapFormInputControl,
  SwapFormOutput,
  SwapFormOutputControl
} from '@features/swaps/core/services/swaps-form-service/models/swap-form-controls';
import { distinctObjectUntilChanged } from '@shared/utils/distinct-object-until-changed';

function shareReplayConfigured<T>() {
  return shareReplay<T>({ bufferSize: 1, refCount: true });
}

@Injectable({
  providedIn: 'root'
})
export class SwapsFormService {
  public readonly form = new FormGroup<SwapForm>({
    input: new FormGroup<SwapFormInputControl>({
      fromBlockchain: new FormControl<BlockchainName>(null),
      toBlockchain: new FormControl<BlockchainName>(BLOCKCHAIN_NAME.ETHEREUM),
      fromToken: new FormControl<TokenAmount>(null),
      toToken: new FormControl<TokenAmount>(null),
      fromAmount: new FormControl<BigNumber>(null)
    }),
    output: new FormGroup<SwapFormOutputControl>({
      toAmount: new FormControl<BigNumber>(null)
    })
  });

  /**
   * Input control, used to patch value.
   */
  public readonly inputControl = this.form.controls.input;

  public get inputValue(): SwapFormInput {
    return this.form.get('input').value;
  }

  private readonly _inputValue$ = new BehaviorSubject<SwapFormInput>(this.inputValue);

  public readonly inputValue$ = this._inputValue$.asObservable();

  public readonly fromBlockchain$: Observable<BlockchainName> = this.inputValue$.pipe(
    map(inputValue => inputValue.fromBlockchain),
    distinctUntilChanged(),
    shareReplayConfigured()
  );

  public readonly toBlockchain$: Observable<BlockchainName> = this.inputValue$.pipe(
    map(inputValue => inputValue.toBlockchain),
    distinctUntilChanged(),
    shareReplayConfigured()
  );

  public readonly toToken$: Observable<TokenAmount> = this.inputValue$.pipe(
    map(inputValue => inputValue.toToken),
    distinctObjectUntilChanged(),
    shareReplayConfigured()
  );

  /**
   * Output control, used to patch value.
   */
  public readonly outputControl = this.form.controls.output;

  public get outputValue(): SwapFormOutput {
    return this.form.get('output').value;
  }

  private readonly _outputValue$ = new BehaviorSubject<SwapFormOutput>(this.outputValue);

  public readonly outputValue$ = this._outputValue$.asObservable();

  private readonly _isFilled$: BehaviorSubject<boolean> = observableToBehaviorSubject(
    this.inputValue$.pipe(
      map(form =>
        Boolean(
          form.fromBlockchain &&
            form.toBlockchain &&
            form.fromToken &&
            form.toToken &&
            form.fromAmount?.gt(0)
        )
      )
    ),
    false
  );

  public readonly isFilled$ = this._isFilled$.asObservable();

  public get isFilled(): boolean {
    return this._isFilled$.getValue();
  }

  constructor() {
    this.subscribeOnFormValueChange();
  }

  private subscribeOnFormValueChange(): void {
    this.form.get('input').valueChanges.subscribe(inputValue => {
      this._inputValue$.next(inputValue);
    });

    this.form.get('output').valueChanges.subscribe(outputValue => {
      this._outputValue$.next(outputValue);
    });
  }
}
