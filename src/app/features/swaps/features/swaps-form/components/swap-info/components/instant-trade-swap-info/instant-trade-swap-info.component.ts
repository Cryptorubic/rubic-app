import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Self, Input } from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import BigNumber from 'bignumber.js';
import { BigNumberFormatPipe } from '@shared/pipes/big-number-format.pipe';
import { WithRoundPipe } from '@shared/pipes/with-round.pipe';
import { SwapInfoService } from '@features/swaps/features/swaps-form/components/swap-info/services/swap-info.service';
import { PERMITTED_PRICE_DIFFERENCE } from '@shared/constants/common/permited-price-difference';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';
import {
  BLOCKCHAIN_NAME,
  BridgersTrade,
  OnChainTrade,
  PriceTokenAmount,
  TokenAmountSymbol
} from 'rubic-sdk';

@Component({
  selector: 'app-instant-trade-swap-info',
  templateUrl: './instant-trade-swap-info.component.html',
  styleUrls: ['./instant-trade-swap-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class InstantTradeSwapInfoComponent {
  @Input() set currentOnChainTrade(onChainTrade: OnChainTrade) {
    this.setTradeData(onChainTrade);
  }

  public toToken: PriceTokenAmount;

  public minimumReceived: BigNumber;

  public slippage: number;

  public priceImpact: number;

  public rateType: 'fromTokenRate' | 'toTokenRate';

  public path: string[];

  public isBridgers: boolean;

  public cryptoFeeToken: TokenAmountSymbol;

  public platformFeePercent: number;

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
        { decimals: toToken.decimals }
      );
      return `1 ${fromToken.symbol} = ${rateFormatted} ${toToken.symbol}`;
    }

    const rateFormatted = this.withRoundPipe.transform(
      this.bigNumberFormatPipe.transform(fromAmount.dividedBy(toAmount)),
      'toClosestValue',
      { decimals: fromToken.decimals }
    );
    return `${rateFormatted} ${fromToken.symbol} = 1 ${toToken.symbol}`;
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapInfoService: SwapInfoService,
    private readonly swapFormService: SwapFormService,
    private readonly priceImpactService: PriceImpactService,
    private readonly bigNumberFormatPipe: BigNumberFormatPipe,
    private readonly withRoundPipe: WithRoundPipe,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.rateType = 'fromTokenRate';
  }

  public switchRateType(): void {
    this.rateType = this.rateType === 'fromTokenRate' ? 'toTokenRate' : 'fromTokenRate';
  }

  private setTradeData(trade: OnChainTrade): void {
    if (trade) {
      this.minimumReceived = trade.toTokenAmountMin.tokenAmount;
      this.slippage = trade.slippageTolerance * 100;
      this.path = trade?.path?.map(token => token.symbol);
      this.setPriceImpact();

      this.toToken = trade.to;
      if (trade instanceof BridgersTrade) {
        this.isBridgers = true;
        if (this.isBridgers) {
          this.cryptoFeeToken = trade.cryptoFeeToken;
          this.platformFeePercent = trade.platformFeePercent;
        }
      } else {
        this.isBridgers = false;
      }

      this.swapInfoService.emitInfoCalculated();
      this.cdr.detectChanges();
    }
  }

  public setPriceImpact(): void {
    const { fromToken, toToken, fromAmount, fromBlockchain } = this.swapFormService.inputValue;
    const { toAmount } = this.swapFormService.outputValue;
    if (fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM_POW) {
      this.priceImpact = null;
    } else {
      this.priceImpact = PriceImpactService.calculatePriceImpact(
        fromToken?.price,
        toToken?.price,
        fromAmount,
        toAmount
      );
    }
    if (this.priceImpact < -PERMITTED_PRICE_DIFFERENCE * 100) {
      this.priceImpact = null;
    }
    this.priceImpactService.setPriceImpact(this.priceImpact);
  }
}
