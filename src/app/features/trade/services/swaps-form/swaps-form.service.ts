import { Inject, Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  SwapForm,
  SwapFormInput,
  SwapFormInputControl,
  SwapFormOutput,
  SwapFormOutputControl
} from '../../models/swap-form-controls';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { compareTokens } from '@shared/utils/utils';
import { shareReplayConfig } from '@shared/constants/common/share-replay-config';
import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { distinctObjectUntilChanged } from '@shared/utils/distinct-object-until-changed';
import BigNumber from 'bignumber.js';
import { observableToBehaviorSubject } from '@shared/utils/observableToBehaviorSubject';
import { compareAssets } from '@features/trade/utils/compare-assets';
import { DOCUMENT } from '@angular/common';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { Web3Pure } from '@cryptorubic/web3';

@Injectable({
  providedIn: 'root'
})
export class SwapsFormService {
  public readonly form = new FormGroup<SwapForm>({
    input: new FormGroup<SwapFormInputControl>({
      fromBlockchain: new FormControl(null),
      fromAmount: new FormControl(null),
      fromToken: new FormControl(null),
      toBlockchain: new FormControl(null),
      toToken: new FormControl(null)
    }),
    output: new FormGroup<SwapFormOutputControl>({
      toAmount: new FormControl(null)
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

  public readonly inputValueDistinct$ = this.inputValue$.pipe(
    distinctUntilChanged(
      (prev, next) =>
        prev.toBlockchain === next.toBlockchain &&
        prev.fromBlockchain === next.fromBlockchain &&
        compareAssets(prev.fromToken, next.fromToken) &&
        compareTokens(prev.toToken, next.toToken) &&
        prev.fromAmount === next.fromAmount
    ),
    shareReplay(shareReplayConfig)
  );

  public readonly fromBlockchain$: Observable<BlockchainName | null> = this.inputValue$.pipe(
    map(inputValue => inputValue.fromBlockchain),
    distinctUntilChanged(),
    shareReplay(shareReplayConfig)
  );

  public readonly toBlockchain$: Observable<BlockchainName> = this.inputValue$.pipe(
    map(inputValue => inputValue.toBlockchain),
    distinctUntilChanged(),
    shareReplay(shareReplayConfig)
  );

  public readonly fromToken$: Observable<BalanceToken | null> = this.inputValue$.pipe(
    map(inputValue => inputValue.fromToken),
    distinctObjectUntilChanged(),
    shareReplay(shareReplayConfig)
  );

  public readonly toToken$: Observable<BalanceToken> = this.inputValue$.pipe(
    map(inputValue => inputValue.toToken),
    distinctObjectUntilChanged(),
    shareReplay(shareReplayConfig)
  );

  public readonly fromAmount$: Observable<{ visibleValue: string; actualValue: BigNumber }> =
    this.inputValue$.pipe(
      map(inputValue => inputValue.fromAmount),
      distinctUntilChanged(),
      shareReplay(shareReplayConfig)
    );

  /**
   * Output control, used to patch value.
   */
  public readonly outputControl = this.form.controls.output;

  public get outputValue(): SwapFormOutput {
    return this.outputControl.getRawValue();
  }

  private readonly _outputValue$ = new BehaviorSubject<SwapFormOutput>(this.outputValue);

  public readonly outputValue$ = this._outputValue$.asObservable();

  public readonly outputValueDistinct$ = this.outputValue$.pipe(
    distinctUntilChanged(),
    shareReplay(shareReplayConfig)
  );

  public readonly toAmount$: Observable<BigNumber> = this.outputValue$.pipe(
    map(value => value.toAmount),
    distinctUntilChanged(),
    shareReplay(shareReplayConfig)
  );

  private readonly _isFilled$: BehaviorSubject<boolean> = observableToBehaviorSubject(
    this.inputValue$.pipe(
      map(form =>
        Boolean(
          form.fromBlockchain &&
            form.fromToken?.address &&
            form.toBlockchain &&
            form.toToken?.address &&
            form.fromAmount?.actualValue?.gt(0)
        )
      )
    ),
    false
  );

  public readonly isFilled$ = this._isFilled$.asObservable();

  public get isFilled(): boolean {
    return this._isFilled$.getValue();
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    this.subscribeOnFormValueChange();
  }

  private subscribeOnFormValueChange(): void {
    this.form.get('input').valueChanges.subscribe(inputValue => {
      const currInputValue = {
        ...inputValue,
        fromToken: inputValue?.fromToken?.address ? inputValue.fromToken : null,
        toToken: inputValue?.toToken?.address ? inputValue.toToken : null
      };
      this._inputValue$.next(currInputValue);

      this.walletConnectorService.selectedChain =
        inputValue?.fromBlockchain || BLOCKCHAIN_NAME.ETHEREUM;
    });

    this.form.get('output').valueChanges.subscribe(outputValue => {
      this._outputValue$.next(outputValue);
    });
  }

  public clearForm(): void {
    this.form.reset();
    this.form.updateValueAndValidity();

    const inputAmountEl = this.document.getElementById(
      'token-amount-input-element'
    ) as HTMLInputElement;
    inputAmountEl.value = '';
  }
}
