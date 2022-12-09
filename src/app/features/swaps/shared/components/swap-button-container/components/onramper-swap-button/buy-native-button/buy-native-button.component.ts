import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { OnramperSwapButtonService } from '@features/swaps/shared/components/swap-button-container/services/onramper-swap-button.service';
import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';

@Component({
  selector: 'app-buy-native-button',
  templateUrl: './buy-native-button.component.html',
  styleUrls: ['./buy-native-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyNativeButtonComponent {
  @Output() readonly onClick = new EventEmitter<void>();

  public readonly loading$ = this.onramperSwapButtonService.buyNativeButtonLoading$;

  public readonly disabled$ = this.onramperSwapButtonService.buyNativeButtonDisabled$;

  constructor(
    private readonly onramperSwapButtonService: OnramperSwapButtonService,
    private readonly tradeService: TradeService
  ) {}

  public onHoveredChange(isHovered: boolean): void {
    this.tradeService.isButtonHovered = isHovered;
  }
}
