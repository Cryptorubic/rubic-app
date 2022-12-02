import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { map, startWith } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { SwapFormOutput } from '@features/swaps/features/swaps-form/models/swap-form';

interface TokenRate {
  amount: BigNumber;
  symbol: string;
}

interface TokensRate {
  from: TokenRate;
  to: TokenRate;
}

@Component({
  selector: 'app-tokens-rate',
  templateUrl: './tokens-rate.component.html',
  styleUrls: ['./tokens-rate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensRateComponent {
  public tokensRate$ = this.swapFormService.outputValueChanges.pipe(
    startWith(this.swapFormService.outputValue),
    map(this.getTokenRate)
  );

  public rateDirection: 'from' | 'to' = 'from';

  constructor(private readonly swapFormService: SwapFormService) {}

  public onChangeDirection(): void {
    this.rateDirection = this.rateDirection === 'from' ? 'to' : 'from';
  }

  private getTokenRate(outputForm: SwapFormOutput): TokensRate | null {
    const { toAmount } = outputForm;

    if (toAmount?.isFinite()) {
      const { fromAmount, fromToken, toToken } = this.swapFormService.inputValue;

      return {
        from: {
          amount: fromAmount.dividedBy(toAmount),
          symbol: fromToken.symbol
        },
        to: {
          amount: toAmount.dividedBy(fromAmount),
          symbol: toToken.symbol
        }
      };
    }

    return null;
  }
}
