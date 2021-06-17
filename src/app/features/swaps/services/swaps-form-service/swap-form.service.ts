import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import BigNumber from 'bignumber.js';
import { ProviderControllerData } from 'src/app/shared/components/provider-panel/provider-panel.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { SwapForm } from '../../models/SwapForm';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { IToken } from '../../../../shared/models/tokens/IToken';

@Injectable({
  providedIn: 'root'
})
export class SwapFormService {
  public commonTrade: FormGroup<SwapForm>;

  private readonly instantTradeProviders: BehaviorSubject<ProviderControllerData[]>;

  public setItProviders(providers) {
    this.instantTradeProviders.next(providers as any);
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
