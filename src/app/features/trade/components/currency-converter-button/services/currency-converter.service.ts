import { Injectable } from '@angular/core';
import { BehaviorSubject, map, skip, tap } from 'rxjs';
import { CONVERSION_DIRECTION, ConversionDirection } from '../constants/currency-mode';
import BigNumber from 'bignumber.js';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { SwapsFormService } from '@app/features/trade/services/swaps-form/swaps-form.service';
import { StoreService } from '@app/core/services/store/store.service';

@Injectable()
export class CurrencyConverterService {
  private readonly _isDollarMode$ = new BehaviorSubject(false);

  public readonly isDollarMode$ = this._isDollarMode$.asObservable();

  public readonly isDollarModeDisabled$ = this.swapFormService.fromToken$.pipe(
    skip(1),
    map(fromToken => !fromToken?.price),
    tap(isDisabled => isDisabled && this.switchCurrencyMode(false))
  );

  constructor(
    private readonly swapFormService: SwapsFormService,
    private readonly storeService: StoreService
  ) {
    this.switchCurrencyMode(this.storeService.getItem('IS_DOLLAR_MODE') ?? false);
  }

  public switchCurrencyMode(isDollarMode: boolean): void {
    this._isDollarMode$.next(isDollarMode);
    this.storeService.setItem('IS_DOLLAR_MODE', isDollarMode);
  }

  public convertAmount(token: TokenAmount, convertUsd: ConversionDirection): BigNumber {
    if (this._isDollarMode$.getValue()) {
      return convertUsd === CONVERSION_DIRECTION.TO
        ? token.amount.multipliedBy(token.price).dp(2, BigNumber.ROUND_HALF_EVEN)
        : token.amount.dividedBy(token.price).dp(token.decimals, BigNumber.ROUND_DOWN);
    }

    return token.amount;
  }
}
