import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { of } from 'rxjs';

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

  // public readonly isLimitOrder$ = this.swapTypeService.swapMode$.pipe(
  //   map(swapType => swapType === SWAP_PROVIDER_TYPE.LIMIT_ORDER)
  // );
  public readonly isLimitOrder$ = of(false);

  constructor() {}

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
