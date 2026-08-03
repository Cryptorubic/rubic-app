import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, map } from 'rxjs';
import { getCorrectAddressValidator } from '../../components/target-network-address/utils/get-correct-address-validator';
import { SwapFormInput } from '../../models/swap-form-controls';
import { SelectedTrade } from '../../models/selected-trade';
import {
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType,
  ON_CHAIN_TRADE_TYPE,
  OnChainTradeType
} from '@cryptorubic/core';

@Injectable()
export class RefundService {
  public readonly refundAddressCtrl = new FormControl<string>('', {
    validators: [Validators.required],
    asyncValidators: []
  });

  private readonly _isValidRefundAddress$ = new BehaviorSubject<boolean>(false);

  public readonly isValidRefundAddress$ = this._isValidRefundAddress$.asObservable();

  private readonly refundAddressRequiredTradeTypes: (OnChainTradeType | CrossChainTradeType)[] = [
    CROSS_CHAIN_TRADE_TYPE.CHANGELLY,
    CROSS_CHAIN_TRADE_TYPE.NEAR_INTENTS,
    CROSS_CHAIN_TRADE_TYPE.INSTASWAP,
    CROSS_CHAIN_TRADE_TYPE.CHANGE_HERO,
    ON_CHAIN_TRADE_TYPE.CLEARSWAP
  ];

  public get refundAddress(): string {
    return this.refundAddressCtrl.value;
  }

  constructor() {
    this.refundAddressCtrl.statusChanges
      .pipe(
        map(status => status === 'VALID'),
        takeUntilDestroyed()
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
    if (this.isRefundAddressRequired(trade.tradeType)) {
      this.refundAddressCtrl.addValidators([Validators.required]);
      this._isValidRefundAddress$.next(false);
    } else {
      this.refundAddressCtrl.clearValidators();
      this._isValidRefundAddress$.next(true);
    }

    this.refundAddressCtrl.updateValueAndValidity();
  }

  private isRefundAddressRequired(tradeType: OnChainTradeType | CrossChainTradeType): boolean {
    return this.refundAddressRequiredTradeTypes.includes(tradeType);
  }
}
