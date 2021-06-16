import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

@Injectable({
  providedIn: 'root'
})
export class SwapFormService {
  public commonTrade: FormGroup;

  constructor() {
    this.commonTrade = new FormGroup({
      fromBlockchain: new FormControl(BLOCKCHAIN_NAME.ETHEREUM),
      toBlockchain: new FormControl(BLOCKCHAIN_NAME.ETHEREUM),
      fromToken: new FormControl(),
      toToken: new FormControl(),
      fromAmount: new FormControl()
    });
  }
}
