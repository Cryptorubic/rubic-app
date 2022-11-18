/* eslint-disable rxjs/finnish */
import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import BigNumber from 'bignumber.js';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';
import { FormService } from '@shared/models/swaps/form-service';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  SwapForm,
  SwapFormInput,
  SwapFormOutput
} from '@features/swaps/features/swaps-form/models/swap-form';
import { first, map, share } from 'rxjs/operators';
import { observableToBehaviorSubject } from '@shared/utils/observableToBehaviorSubject';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';

@Injectable({
  providedIn: 'root'
})
export class SwapFormService implements FormService {
  public commonTrade: FormGroup<SwapForm>;

  public get input(): FormGroup<SwapFormInput> {
    return this.commonTrade.controls.input;
  }

  public get inputValue(): SwapFormInput {
    return this.input.value;
  }

  public get inputValueChanges(): Observable<SwapFormInput> {
    return this.input.valueChanges;
  }

  public get output(): FormGroup<SwapFormOutput> {
    return this.commonTrade.controls.output;
  }

  public get outputValue(): SwapFormOutput {
    return this.output.value;
  }

  public get outputValueChanges(): Observable<SwapFormOutput> {
    return this.output.valueChanges;
  }

  private readonly _isFilled$: BehaviorSubject<boolean>;

  public readonly isFilled$: Observable<boolean>;

  public get isFilled(): boolean {
    return this._isFilled$.getValue();
  }

  constructor(private readonly walletConnectorService: WalletConnectorService) {
    this.commonTrade = new FormGroup<SwapForm>({
      input: new FormGroup<SwapFormInput>({
        fromBlockchain: new FormControl<BlockchainName>(null),
        toBlockchain: new FormControl<BlockchainName>(BLOCKCHAIN_NAME.ETHEREUM),
        fromToken: new FormControl<TokenAmount>(null),
        toToken: new FormControl<TokenAmount>(null),
        fromAmount: new FormControl<BigNumber>(null)
      }),
      output: new FormGroup<SwapFormOutput>({
        toAmount: new FormControl<BigNumber>()
      })
    });

    this.walletConnectorService.networkChange$.pipe(first(Boolean)).subscribe(network => {
      this.input.patchValue(
        { fromBlockchain: network },
        {
          emitEvent: false
        }
      );
    });

    this._isFilled$ = observableToBehaviorSubject(
      this.inputValueChanges.pipe(
        map(form =>
          Boolean(
            form.fromBlockchain &&
              form.toBlockchain &&
              form.fromToken &&
              form.toToken &&
              form.fromAmount?.gt(0)
          )
        ),
        share()
      ),
      false
    );
    this.isFilled$ = this._isFilled$.asObservable();
  }
}
