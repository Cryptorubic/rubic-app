import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import BigNumber from 'bignumber.js';
import { SwapForm } from '../../models/SwapForm';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { IToken } from '../../../../shared/models/tokens/IToken';

@Injectable({
  providedIn: 'root'
})
export class SwapFormService {
  public commonTrade: FormGroup<SwapForm>;

  constructor() {
    this.commonTrade = new FormGroup<SwapForm>({
      input: new FormGroup({
        fromBlockchain: new FormControl<BLOCKCHAIN_NAME>(BLOCKCHAIN_NAME.ETHEREUM),
        toBlockchain: new FormControl<BLOCKCHAIN_NAME>(BLOCKCHAIN_NAME.ETHEREUM),
        fromToken: new FormControl<IToken>(),
        toToken: new FormControl<IToken>(),
        fromAmount: new FormControl<BigNumber>()
      }),
      output: new FormGroup({
        toAmount: new FormControl<BigNumber>()
      })
    });
  }
}
