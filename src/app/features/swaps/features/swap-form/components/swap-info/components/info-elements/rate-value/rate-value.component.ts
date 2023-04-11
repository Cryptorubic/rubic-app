import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { OnChainTrade } from 'rubic-sdk';
import { CrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { WithRoundPipe } from '@shared/pipes/with-round.pipe';
import { BigNumberFormatPipe } from '@shared/pipes/big-number-format.pipe';

@Component({
  selector: 'app-rate-value',
  templateUrl: './rate-value.component.html',
  styleUrls: ['./rate-value.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RateValueComponent {
  public rateType: 'fromTokenRate' | 'toTokenRate' = 'fromTokenRate';

  public rate: string;

  @Input() set trade(trade: OnChainTrade | CrossChainTrade | undefined) {
    this._trade = trade;
    this.rate = trade ? this.getRate() : '';
  }

  private _trade: OnChainTrade | CrossChainTrade | undefined;

  constructor(
    private readonly withRoundPipe: WithRoundPipe,
    private readonly bigNumberFormatPipe: BigNumberFormatPipe,
    private readonly cdr: ChangeDetectorRef
  ) {}

  public switchRateType(): void {
    this.rateType = this.rateType === 'fromTokenRate' ? 'toTokenRate' : 'fromTokenRate';
    this.rate = this.getRate();
    this.cdr.detectChanges();
  }

  public getRate(): string {
    const fromToken = this._trade.from;
    const toToken = this._trade.to;

    if (!fromToken.tokenAmount?.isFinite() || !toToken.tokenAmount?.isFinite()) {
      return '';
    }

    if (this.rateType === 'fromTokenRate') {
      const rateFormatted = this.withRoundPipe.transform(
        this.bigNumberFormatPipe.transform(toToken.tokenAmount.dividedBy(fromToken.tokenAmount)),
        'toClosestValue',
        { decimals: toToken.decimals }
      );
      return `1 ${fromToken.symbol} = ${rateFormatted} ${toToken.symbol}`;
    }

    const rateFormatted = this.withRoundPipe.transform(
      this.bigNumberFormatPipe.transform(fromToken.tokenAmount.dividedBy(toToken.tokenAmount)),
      'toClosestValue',
      { decimals: fromToken.decimals }
    );
    return `${rateFormatted} ${fromToken.symbol} = 1 ${toToken.symbol}`;
  }
}
