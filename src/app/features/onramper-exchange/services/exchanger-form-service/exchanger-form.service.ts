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

@Injectable({
  providedIn: 'root'
})
export class ExchangerFormService {
  private readonly form = new FormGroup<ExchangerForm>({
    input: new FormGroup({
      fromFiat: new FormControl<string | null>(null),
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
