import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

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
