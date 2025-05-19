import { Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { BehaviorSubject, map, takeUntil } from 'rxjs';
import { getCorrectAddressValidator } from '../../components/target-network-address/utils/get-correct-address-validator';
import { SwapFormInput } from '../../models/swap-form-controls';
import { SelectedTrade } from '../../models/selected-trade';
import { CROSS_CHAIN_TRADE_TYPE } from 'rubic-sdk';

@Injectable()
export class RefundService {
  public readonly refundAddressCtrl = new FormControl<string>('', {
    validators: [Validators.required],
    asyncValidators: []
  });

  private readonly _isValidRefundAddress$ = new BehaviorSubject<boolean>(false);

  public readonly isValidRefundAddress$ = this._isValidRefundAddress$.asObservable();

  public get refundAddress(): string {
    return this.refundAddressCtrl.value;
  }

  constructor(private readonly destroy$: TuiDestroyService) {
    this.refundAddressCtrl.statusChanges
      .pipe(
        map(status => status === 'VALID'),
        takeUntil(this.destroy$)
      )
      .subscribe(isValid => {
        this._isValidRefundAddress$.next(isValid);
      });
  }

  public setRefundAddress(value: string): void {
    this.refundAddressCtrl.setValue(value);
  }

  public onSwapFormInputChanged(input: SwapFormInput): void {
    this.refundAddressCtrl.clearAsyncValidators();
    this.refundAddressCtrl.setAsyncValidators(
      getCorrectAddressValidator({
        fromAssetType: input.fromBlockchain,
        validatedChain: input.fromBlockchain
      })
    );
    this.refundAddressCtrl.updateValueAndValidity();
  }

  public onTradeSelection(trade: SelectedTrade): void {
    if (trade.tradeType === CROSS_CHAIN_TRADE_TYPE.CHANGELLY) {
      this.refundAddressCtrl.addValidators([Validators.required]);
      this._isValidRefundAddress$.next(false);
    } else {
      this.refundAddressCtrl.clearValidators();
      this._isValidRefundAddress$.next(true);
    }

    this.refundAddressCtrl.updateValueAndValidity();
  }
}
