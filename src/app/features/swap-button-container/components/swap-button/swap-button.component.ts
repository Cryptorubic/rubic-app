import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { PRICE_IMPACT_RANGE } from '@shared/models/swaps/price-impact-range';
import { SwapButtonService } from '@features/swap-button-container/services/swap-button.service';
import { SwapButtonContainerService } from '@features/swap-button-container/services/swap-button-container.service';

@Component({
  selector: 'app-swap-button',
  templateUrl: './swap-button.component.html',
  styleUrls: ['./swap-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapButtonComponent {
  @Output() readonly onClick = new EventEmitter<void>();

  public readonly idPrefix = this.swapButtonContainerService.idPrefix;

  public readonly loading$ = this.swapButtonService.loading$;

  public readonly disabled$ = this.swapButtonService.disabled$;

  public readonly warningMedium$ = this.swapButtonService.warningMedium$;

  public readonly warningHigh$ = this.swapButtonService.warningHigh$;

  public readonly buttonText$ = this.swapButtonService.buttonText$;

  constructor(
    private readonly swapButtonContainerService: SwapButtonContainerService,
    private readonly swapButtonService: SwapButtonService
  ) {}

  public onSwapClick(): void {
    if (this.swapButtonService.priceImpact >= PRICE_IMPACT_RANGE.HIGH) {
      if (
        // eslint-disable-next-line no-alert
        prompt(
          `This swap has a price impact of ${PRICE_IMPACT_RANGE.HIGH}% or more. Please type the word "confirm" to continue with this swap.\n\nPlease, take into account, that a non-refundable loss may happen. You’ll possibly loose the major part of the assets you are transferring.`
        ) !== 'confirm'
      ) {
        return;
      }
    }
    this.onClick.emit();
  }
}
