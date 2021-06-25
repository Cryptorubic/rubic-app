import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import { SwapForm } from 'src/app/features/swaps/models/SwapForm';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import BigNumber from 'bignumber.js';
import { FormService } from 'src/app/shared/models/swaps/FormService';

@Injectable()
export class CryptoTapFormService implements FormService {
  public commonTrade: FormGroup<SwapForm>;

  constructor() {
    this.commonTrade = new FormGroup<SwapForm>({
      input: new FormGroup({
        fromBlockchain: new FormControl<BLOCKCHAIN_NAME>(BLOCKCHAIN_NAME.ETHEREUM),
        toBlockchain: new FormControl<BLOCKCHAIN_NAME>(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN),
        fromToken: new FormControl<TokenAmount>(),
        toToken: new FormControl<TokenAmount>(),
        fromAmount: new FormControl<BigNumber>(new BigNumber(0))
      }),
      output: new FormGroup({
        toAmount: new FormControl<BigNumber>(new BigNumber(0)),
        fee: new FormControl<BigNumber>()
      })
    });
  }
}
