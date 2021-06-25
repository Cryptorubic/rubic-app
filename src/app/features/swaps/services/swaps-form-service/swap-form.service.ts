import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import BigNumber from 'bignumber.js';
import { ProviderControllerData } from 'src/app/shared/components/provider-panel/provider-panel.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { SwapForm } from '../../models/SwapForm';

@Injectable({
  providedIn: 'root'
})
export class SwapFormService implements FormService {
  public commonTrade: FormGroup<SwapForm>;

  private readonly instantTradeProviders: BehaviorSubject<ProviderControllerData[]>;

  public setItProviders(providers) {
    this.instantTradeProviders.next(providers);
  }

  public get itProviders(): Observable<ProviderControllerData[]> {
    return this.instantTradeProviders.asObservable();
  }

  constructor() {
    this.instantTradeProviders = new BehaviorSubject([]);
    this.commonTrade = new FormGroup<SwapForm>({
      input: new FormGroup({
        fromBlockchain: new FormControl<BLOCKCHAIN_NAME>(BLOCKCHAIN_NAME.ETHEREUM),
        toBlockchain: new FormControl<BLOCKCHAIN_NAME>(BLOCKCHAIN_NAME.ETHEREUM),
        fromToken: new FormControl<TokenAmount>(),
        toToken: new FormControl<TokenAmount>(),
        fromAmount: new FormControl<BigNumber>()
      }),
      output: new FormGroup({
        toAmount: new FormControl<BigNumber>()
      })
    });
  }
}
