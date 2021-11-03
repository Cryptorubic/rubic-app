import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Self,
  OnInit,
  Input
} from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapFormService } from '@features/swaps/services/swaps-form-service/swap-form.service';
import { SettingsService } from '@features/swaps/services/settings-service/settings.service';
import BigNumber from 'bignumber.js';
import { startWith, takeUntil } from 'rxjs/operators';
import { subtractPercent } from '@shared/utils/utils';
import { BigNumberFormatPipe } from '@shared/pipes/big-number-format.pipe';
import { WithRoundPipe } from '@shared/pipes/with-round.pipe';
import InstantTrade from '@features/instant-trade/models/InstantTrade';
import { InstantTradeService } from '@features/instant-trade/services/instant-trade-service/instant-trade.service';
import { PriceImpactCalculator } from '@shared/utils/price-impact/price-impact-calculator';
import { PRICE_IMPACT_RANGE } from '@shared/utils/price-impact/models/PRICE_IMPACT_RANGE';
import { SwapInfoService } from '@features/swaps/components/swap-info/services/swap-info.service';

@Component({
  selector: 'app-instant-trade-swap-info',
  templateUrl: './instant-trade-swap-info.component.html',
  styleUrls: ['./instant-trade-swap-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class InstantTradeSwapInfoComponent implements OnInit {
  @Input() set currentInstantTrade(instantTrade: InstantTrade) {
    if (InstantTradeService.isUniswapV2Trade(instantTrade)) {
      this.path = instantTrade.path.map(token => token.symbol);
    } else {
      this.path = [];
    }
  }

  public readonly PRICE_IMPACT_RANGE = PRICE_IMPACT_RANGE;

  public minimumReceived: BigNumber;

  public slippage: number;

  public priceImpact: number;

  public rateType: 'fromTokenRate' | 'toTokenRate';

  public path: string[];

  public get minimumReceivedFormatted(): string {
    const { toToken } = this.swapFormService.inputValue;
    const minimumReceivedString = this.bigNumberFormatPipe.transform(this.minimumReceived);
    return `${this.withRoundPipe.transform(
      minimumReceivedString,
      'toClosestValue',
      toToken.decimals
    )} ${toToken.symbol}`;
  }

  public get rate(): string {
    const { fromAmount, fromToken, toToken } = this.swapFormService.inputValue;
    const { toAmount } = this.swapFormService.outputValue;
    if (!fromAmount?.isFinite() || !toAmount?.isFinite()) {
      return '';
    }

    if (this.rateType === 'fromTokenRate') {
      const rateString = this.bigNumberFormatPipe.transform(toAmount.dividedBy(fromAmount));
      const rate = this.withRoundPipe.transform(rateString, 'toClosestValue', toToken.decimals);
      return `1 ${fromToken.symbol} = ${rate} ${toToken.symbol}`;
    }

    const rateString = this.bigNumberFormatPipe.transform(fromAmount.dividedBy(toAmount));
    const rate = this.withRoundPipe.transform(rateString, 'toClosestValue', fromToken.decimals);
    return `${rate} ${fromToken.symbol} = 1 ${toToken.symbol}`;
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapInfoService: SwapInfoService,
    private readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService,
    private readonly bigNumberFormatPipe: BigNumberFormatPipe,
    private readonly withRoundPipe: WithRoundPipe,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.rateType = 'fromTokenRate';
  }

  ngOnInit() {
    this.initSubscriptions();
  }

  private initSubscriptions(): void {
    this.swapFormService.outputValueChanges
      .pipe(startWith(this.swapFormService.outputValue), takeUntil(this.destroy$))
      .subscribe(() => {
        this.slippage = this.settingsService.instantTradeValue.slippageTolerance;
        this.setSlippageAndMinimumReceived();

        const { fromToken, toToken, fromAmount } = this.swapFormService.inputValue;
        const { toAmount } = this.swapFormService.outputValue;
        this.priceImpact = PriceImpactCalculator.calculateItPriceImpact(
          fromToken,
          toToken,
          fromAmount,
          toAmount
        );

        this.swapInfoService.setInfoCalculated();

        this.cdr.markForCheck();
      });

    this.settingsService.instantTrade.controls.slippageTolerance.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(slippage => {
        this.slippage = slippage;
        this.setSlippageAndMinimumReceived();
        this.cdr.markForCheck();
      });
  }

  private setSlippageAndMinimumReceived(): void {
    const { toAmount } = this.swapFormService.outputValue;
    if (toAmount?.isFinite()) {
      this.minimumReceived = subtractPercent(toAmount, this.slippage / 100);
    }
  }

  public switchRateType(): void {
    this.rateType = this.rateType === 'fromTokenRate' ? 'toTokenRate' : 'fromTokenRate';
  }
}
