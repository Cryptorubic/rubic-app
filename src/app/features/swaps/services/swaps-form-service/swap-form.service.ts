import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { ProviderControllerData } from 'src/app/shared/components/provider-panel/provider-panel.component';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SwapFormService {
  public commonTrade: FormGroup;

  private readonly instantTradeProviders: BehaviorSubject<ProviderControllerData[]>;

  public setItProviders(providers) {
    this.instantTradeProviders.next(providers as any);
  }

  public get itProviders(): Observable<ProviderControllerData[]> {
    return this.instantTradeProviders.asObservable();
  }

  constructor() {
    this.instantTradeProviders = new BehaviorSubject([]);
    this.commonTrade = new FormGroup({
      fromBlockchain: new FormControl(BLOCKCHAIN_NAME.ETHEREUM),
      toBlockchain: new FormControl(BLOCKCHAIN_NAME.ETHEREUM),
      fromToken: new FormControl(),
      toToken: new FormControl(),
      fromAmount: new FormControl()
    });
  }
}
