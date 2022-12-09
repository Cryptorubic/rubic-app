import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Self, Input } from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import BigNumber from 'bignumber.js';
import { BigNumberFormatPipe } from '@shared/pipes/big-number-format.pipe';
import { WithRoundPipe } from '@shared/pipes/with-round.pipe';
import { SwapInfoService } from '@features/swaps/features/swap-form/components/swap-info/services/swap-info.service';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';
import {
  BLOCKCHAIN_NAME,
  BridgersTrade,
  EvmOnChainTrade,
  OnChainPlatformFee,
  OnChainTrade,
  PriceTokenAmount,
  TokenAmount
} from 'rubic-sdk';
import { InstantTradeService } from '@features/swaps/features/instant-trade/services/instant-trade-service/instant-trade.service';

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

  public cryptoFeeToken: TokenAmount;

  public fixedFeeToken: TokenAmount;

  public platformFee: OnChainPlatformFee;

  public get rate(): string {
    const { fromAmount, fromToken, toToken } = this.instantTradeService.inputValue;
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
    private readonly instantTradeService: InstantTradeService,
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

      if (trade instanceof EvmOnChainTrade) {
        this.fixedFeeToken = trade.proxyFeeInfo?.fixedFeeToken;
        this.platformFee = trade.proxyFeeInfo?.platformFee;
      }

      this.isBridgers = trade instanceof BridgersTrade;
      if (trade instanceof BridgersTrade) {
        this.isBridgers = true;
        this.cryptoFeeToken = trade.cryptoFeeToken;
        this.platformFee = trade.platformFee;
      } else {
        this.isBridgers = false;
      }

      this.swapInfoService.emitInfoCalculated();
      this.cdr.detectChanges();
    }
  }

  public setPriceImpact(): void {
    const { fromToken, toToken, fromAmount, fromBlockchain } = this.instantTradeService.inputValue;
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
    this.priceImpactService.setPriceImpact(this.priceImpact);
  }
}
