import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class SwapFormService {
  public commonTrade: FormGroup;

  constructor() {
    this.commonTrade = new FormGroup({
      fromBlockchain: new FormControl(),
      toBlockchain: new FormControl(),
      fromToken: new FormControl(),
      toToken: new FormControl(),
      fromAmount: new FormControl()
    });
  }
}
