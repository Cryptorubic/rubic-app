import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';
import { map } from 'rxjs';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';

@Component({
  selector: 'app-platform-tokens-amount',
  templateUrl: './platform-tokens-amount.component.html',
  styleUrls: ['./platform-tokens-amount.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformTokensAmountComponent {
  @Input() public set amountOfTokens(amounts: string) {
    this.amountsArray = this.getAmounts(amounts);
  }

  public amountsArray: string[];

  public readonly isLimitOrder$ = this.swapTypeService.swapMode$.pipe(
    map(swapType => swapType === SWAP_PROVIDER_TYPE.LIMIT_ORDER)
  );

  constructor(private readonly swapTypeService: SwapTypeService) {}

  private getAmounts(amounts: string): string[] {
    return amounts.split('').map(symbol => {
      const isDigit = !Number.isNaN(Number(symbol));
      return isDigit
        ? new Array(Number(symbol) + 1)
            .fill(null)
            .map((_, index) => index)
            .reverse()
            .join(' ')
        : symbol;
    });
  }
}
