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
import { SwapInfoService } from '@features/swaps/components/swap-info/services/swap-info.service';
import { PERMITTED_PRICE_DIFFERENCE } from '@shared/constants/common/PERMITTED_PRICE_DIFFERENCE';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';

@Component({
  selector: 'app-instant-trade-swap-info',
  templateUrl: './instant-trade-swap-info.component.html',
  styleUrls: ['./instant-trade-swap-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class InstantTradeSwapInfoComponent implements OnInit {
  @Input() set currentInstantTrade(instantTrade: InstantTrade) {
    this.path = instantTrade?.path?.map(token => token.symbol);
  }

  public minimumReceived: BigNumber;

  public slippage: number;

  public priceImpact: number;

  public rateType: 'fromTokenRate' | 'toTokenRate';

  public path: string[];

  public get minimumReceivedFormatted(): string {
    if (!this.minimumReceived?.isFinite()) {
      return '';
    }

    const { toToken } = this.swapFormService.inputValue;
    const minimumReceivedFormatter = this.withRoundPipe.transform(
      this.bigNumberFormatPipe.transform(this.minimumReceived),
      'toClosestValue',
      toToken.decimals
    );
    return `${minimumReceivedFormatter} ${toToken.symbol}`;
  }

  public get rate(): string {
    const { fromAmount, fromToken, toToken } = this.swapFormService.inputValue;
    const { toAmount } = this.swapFormService.outputValue;
    if (!fromAmount?.isFinite() || !toAmount?.isFinite()) {
      return '';
    }

    if (this.rateType === 'fromTokenRate') {
      const rateFormatted = this.withRoundPipe.transform(
        this.bigNumberFormatPipe.transform(toAmount.dividedBy(fromAmount)),
        'toClosestValue',
        toToken.decimals
      );
      return `1 ${fromToken.symbol} = ${rateFormatted} ${toToken.symbol}`;
    }

    const rateFormatted = this.withRoundPipe.transform(
      this.bigNumberFormatPipe.transform(fromAmount.dividedBy(toAmount)),
      'toClosestValue',
      fromToken.decimals
    );
    return `${rateFormatted} ${fromToken.symbol} = 1 ${toToken.symbol}`;
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapInfoService: SwapInfoService,
    private readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService,
    private readonly priceImpactService: PriceImpactService,
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
    this.swapFormService.outputValueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const { toAmount } = this.swapFormService.outputValue;
      if (!toAmount?.isFinite()) {
        this.swapInfoService.emitInfoCalculated();
        return;
      }

      this.slippage = this.settingsService.instantTradeValue.slippageTolerance;
      this.setSlippageAndMinimumReceived();

      const { fromToken, toToken, fromAmount } = this.swapFormService.inputValue;
      this.priceImpact = PriceImpactService.calculatePriceImpact(
        fromToken?.price,
        toToken?.price,
        fromAmount,
        toAmount
      );
      if (this.priceImpact < -PERMITTED_PRICE_DIFFERENCE * 100) {
        this.priceImpact = null;
      }
      this.priceImpactService.setPriceImpact(this.priceImpact);

      this.swapInfoService.emitInfoCalculated();

      this.cdr.markForCheck();
    });

    this.settingsService.instantTrade.controls.slippageTolerance.valueChanges
      .pipe(
        startWith(this.settingsService.instantTradeValue.slippageTolerance),
        takeUntil(this.destroy$)
      )
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
