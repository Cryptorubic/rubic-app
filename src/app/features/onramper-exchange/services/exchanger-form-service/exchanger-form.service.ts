import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  ExchangerForm,
  ExchangerFormInput
} from '@features/onramper-exchange/services/exchanger-form-service/models/exchanger-form';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FiatItem } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/fiat-amount-input/components/fiats-selector/models/fiat-item';

@Injectable({
  providedIn: 'root'
})
export class ExchangerFormService {
  private readonly form = new FormGroup<ExchangerForm>({
    input: new FormGroup({
      fromFiat: new FormControl<FiatItem | null>(null),
      fromAmount: new FormControl<BigNumber | null>(null),
      toToken: new FormControl<TokenAmount | null>(null)
    }),
    output: new FormGroup({
      toAmount: new FormControl<BigNumber | null>(null)
    })
  });

  public readonly input = this.form.controls.input;

  public get input$(): Observable<ExchangerFormInput> {
    const input = this.form.get('input');
    return input.valueChanges.pipe(startWith(input.value));
  }

  public get fromFiat$(): Observable<FiatItem | null> {
    const fromFiat = this.form.get('input').get('fromFiat');
    return fromFiat.valueChanges.pipe(startWith(fromFiat.value));
  }

  public get toToken$(): Observable<TokenAmount | null> {
    const toToken = this.form.get('input').get('toToken');
    return toToken.valueChanges.pipe(startWith(toToken.value));
  }

  public get toToken(): TokenAmount | null {
    const toToken = this.form.get('input').get('toToken');
    return toToken.value;
  }

  constructor() {}
}
