import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import BigNumber from 'bignumber.js';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { Observable } from 'rxjs';
import { SwapForm, SwapFormInput, SwapFormOutput } from '../../models/SwapForm';

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

  constructor() {
    this.commonTrade = new FormGroup<SwapForm>({
      input: new FormGroup<SwapFormInput>({
        fromBlockchain: new FormControl<BLOCKCHAIN_NAME>(BLOCKCHAIN_NAME.ETHEREUM),
        toBlockchain: new FormControl<BLOCKCHAIN_NAME>(BLOCKCHAIN_NAME.ETHEREUM),
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
