import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { OnramperSwapButtonService } from '@features/swaps/shared/components/swap-button-container/services/onramper-swap-button.service';
import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { map } from 'rxjs/operators';
import { nativeTokensList } from 'rubic-sdk';
import { OnramperFormCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-form-calculation.service';

@Component({
  selector: 'app-direct-buy-button',
  templateUrl: './direct-buy-button.component.html',
  styleUrls: ['./direct-buy-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DirectBuyButtonComponent {
  @Output() readonly onClick = new EventEmitter<void>();

  public readonly loading$ = this.onramperSwapButtonService.buyNativeButtonLoading$;

  public readonly disabled$ = this.onramperSwapButtonService.buyNativeButtonDisabled$;

  public readonly buyingTokenSymbol$ = this.onramperFormCalculationService.isDirectSwap$.pipe(
    map(isDirectSwap =>
      isDirectSwap
        ? this.swapFormService.inputValue.toToken.symbol
        : nativeTokensList[this.swapFormService.inputValue.toBlockchain].symbol
    )
  );

  constructor(
    private readonly onramperSwapButtonService: OnramperSwapButtonService,
    private readonly tradeService: TradeService,
    private readonly swapFormService: SwapFormService,
    private readonly onramperFormCalculationService: OnramperFormCalculationService
  ) {}

  public onHoveredChange(isHovered: boolean): void {
    this.tradeService.isButtonHovered = isHovered;
  }
}
