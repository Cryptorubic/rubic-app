/* eslint-disable rxjs/finnish */
import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import BigNumber from 'bignumber.js';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { BlockchainName, BLOCKCHAIN_NAME } from 'rubic-sdk';
import { FormService } from '@shared/models/swaps/form-service';
import { Observable } from 'rxjs';
import {
  SwapForm,
  SwapFormInput,
  SwapFormOutput
} from '@features/swaps/features/main-form/models/swap-form';

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

  constructor() {
    this.commonTrade = new FormGroup<SwapForm>({
      input: new FormGroup<SwapFormInput>({
        fromBlockchain: new FormControl<BlockchainName>(BLOCKCHAIN_NAME.ETHEREUM),
        toBlockchain: new FormControl<BlockchainName>(BLOCKCHAIN_NAME.ETHEREUM),
        fromToken: new FormControl<TokenAmount>(null),
        toToken: new FormControl<TokenAmount>(null),
        fromAmount: new FormControl<BigNumber>(null)
      }),
      output: new FormGroup<SwapFormOutput>({
        toAmount: new FormControl<BigNumber>()
      })
    });
  }
}
