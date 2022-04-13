import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-platform-tokens-amount',
  templateUrl: './platform-tokens-amount.component.html',
  styleUrls: ['./platform-tokens-amount.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformTokensAmountComponent {
  @Input() public set amountOfTokens(amounts: number) {
    this.amountsArray = String(amounts)
      .split('')
      .map(digit =>
        new Array(Number(digit) + 1)
          .fill(null)
          .map((_, index) => index)
          .reverse()
      );
  }

  public amountsArray: number[][];

  constructor() {}
}
