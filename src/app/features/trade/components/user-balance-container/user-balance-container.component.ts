import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { HeaderStore } from '@core/header/services/header.store';
import { debounceTime, distinctUntilChanged, filter, map, startWith, tap } from 'rxjs/operators';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { BehaviorSubject, combineLatestWith } from 'rxjs';
import { compareTokens } from '@shared/utils/utils';
import { PreviewSwapService } from '../../services/preview-swap/preview-swap.service';
import BigNumber from 'bignumber.js';
import { SelectedTrade } from '../../models/selected-trade';
import { SwapsStateService } from '../../services/swaps-state/swaps-state.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-balance-container',
  templateUrl: './user-balance-container.component.html',
  styleUrls: ['./user-balance-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserBalanceContainerComponent {
  private readonly _triggerRefresh$ = new BehaviorSubject(null);

  public readonly token$ = this.swapsFormService.fromToken$.pipe(
    combineLatestWith(
      this.swapsFormService.fromAmount$,
      this.swapsStateService.tradeState$,
      this._triggerRefresh$.pipe(startWith())
    ),
    map(([fromToken]) => this.tokensStoreService.tokens.find(t => compareTokens(fromToken, t))),
    tap(token => {
      this.setAvailableMaxAmount(this.swapsStateService.tradeState, token?.amount);
    })
  );

  @Input() public hide: 'maxButton' | 'balance';

  @Output() public maxButtonClickEvent = new EventEmitter<BigNumber>();

  public readonly isMobile = this.headerStore.isMobile;

  private availableMaxAmount: BigNumber = new BigNumber(0);

  constructor(
    private readonly swapsStateService: SwapsStateService,
    private readonly headerStore: HeaderStore,
    private readonly tokensStoreService: TokensStoreService,
    private readonly swapsFormService: SwapsFormService,
    private readonly previewSwapService: PreviewSwapService,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService
  ) {
    this.tokensStoreService.tokens$
      .pipe(
        combineLatestWith(this.previewSwapService.transactionState$),
        distinctUntilChanged(),
        debounceTime(20),
        filter(([_, state]) => state.step === 'success' || state.step === 'inactive'),
        tap(([, state]) => {
          if (state.step === 'success') {
            const fromBlockchain = this.swapsFormService.inputValue.fromBlockchain;
            this.tokensStoreService.startBalanceCalculating(fromBlockchain);
            this._triggerRefresh$.next(null);
          }
        })
      )
      .subscribe();
  }

  private setAvailableMaxAmount(
    tradeState: SelectedTrade,
    amount: BigNumber = new BigNumber(0)
  ): void {
    if (!tradeState.trade || !tradeState.trade.from.isNative) {
      this.availableMaxAmount = amount;
    } else {
      const trade = tradeState.trade;
      const gas = trade.getTradeInfo().estimatedGas || 0;
      const fee = trade.feeInfo;
      let totalFee = new BigNumber(0);

      if (fee.provider?.cryptoFee) {
        totalFee = totalFee.plus(fee.provider.cryptoFee.amount);
      }
      if (fee.rubicProxy?.fixedFee) {
        totalFee = totalFee.plus(fee.rubicProxy.fixedFee.amount);
      }

      const result = amount.minus(totalFee).minus(gas);
      this.availableMaxAmount = result.isLessThanOrEqualTo(0) ? new BigNumber(0) : result;
    }
  }

  public onMaxButtonClick(symbol: string): void {
    if (this.availableMaxAmount.isZero()) {
      const message = this.translateService.instant('errors.insufficientFoundsGasPriceValue', {
        nativeToken: symbol
      });
      this.notificationsService.show(message, {
        status: 'warning',
        autoClose: true,
        icon: '',
        data: null,
        defaultAutoCloseTime: 0
      });
    } else {
      this.maxButtonClickEvent.emit(this.availableMaxAmount);
    }
  }
}
