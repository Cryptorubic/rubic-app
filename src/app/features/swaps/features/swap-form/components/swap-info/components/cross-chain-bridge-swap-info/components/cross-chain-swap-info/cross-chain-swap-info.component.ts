import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Self } from '@angular/core';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { SwapInfoService } from '@features/swaps/features/swap-form/components/swap-info/services/swap-info.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { from, of } from 'rxjs';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';

import {
  Web3Pure,
  BlockchainsInfo as SdkBlockchainsInfo,
  TronBridgersCrossChainTrade,
  EvmBridgersCrossChainTrade,
  CelerCrossChainTrade,
  FeeInfo,
  nativeTokensList
} from 'rubic-sdk';
import { SwapButtonService } from '@features/swaps/shared/components/swap-button-container/services/swap-button.service';
import { CrossChainFormService } from '@features/swaps/features/cross-chain/services/cross-chain-form-service/cross-chain-form.service';

@Component({
  selector: 'app-cross-chain-swap-info',
  templateUrl: './cross-chain-swap-info.component.html',
  styleUrls: ['./cross-chain-swap-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class CrossChainSwapInfoComponent implements OnInit {
  public fromToken: TokenAmount;

  public toToken: TokenAmount;

  public nativeCoinSymbol: string;

  public estimateGasInEth: BigNumber;

  public estimateGasInUsd: BigNumber;

  public minimumReceived: BigNumber;

  public priceImpact: number;

  public priceImpactFrom: number;

  public priceImpactTo: number;

  public slippage: number;

  public twoWaySwap: boolean;

  public isBridgers: boolean;

  public feeInfo: FeeInfo | undefined;

  public nativeCoinDecimals: number;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapInfoService: SwapInfoService,
    private readonly swapFormService: SwapFormService,
    private readonly crossChainFormService: CrossChainFormService,
    private readonly tokensService: TokensService,
    private readonly priceImpactService: PriceImpactService,
    private readonly swapButtonService: SwapButtonService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.subscribeOnInputValue();
    this.subscribeOnOutputValue();
  }

  private subscribeOnInputValue(): void {
    this.swapFormService.inputValueDistinct$.pipe(takeUntil(this.destroy$)).subscribe(form => {
      this.fromToken = form.fromAsset as TokenAmount;
      this.toToken = form.toToken;

      this.cdr.markForCheck();
    });
  }

  /**
   * Subscribes on output form value, and after change gets info from cross chain service to update trade info.
   */
  private subscribeOnOutputValue(): void {
    this.swapFormService.outputValue$
      .pipe(
        switchMap(form => {
          const { toAmount } = form;
          if (!toAmount?.isFinite()) {
            this.swapInfoService.emitInfoCalculated();
            return of(null);
          }

          const { fromBlockchain } = this.crossChainFormService.inputValue;
          return from(this.tokensService.getNativeCoinPriceInUsd(fromBlockchain)).pipe(
            map(nativeCoinPrice => {
              const tokens = this.tokensService.tokens;

              const nativeToken = tokens.find(
                token =>
                  token.blockchain === fromBlockchain &&
                  Web3Pure[SdkBlockchainsInfo.getChainType(token.blockchain)].isNativeAddress(
                    token.address
                  )
              );

              this.nativeCoinSymbol = nativeToken?.symbol;

              this.setTradeInfoParams(nativeCoinPrice);

              this.swapInfoService.emitInfoCalculated();
            })
          );
        }),
        watch(this.cdr),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  /**
   * Sets from and to price impacts and sets maximum as current price impact.
   */
  private setTwoWayPriceImpact(priceImpactFrom: number, priceImpactTo: number): void {
    this.priceImpactFrom = priceImpactFrom;
    this.priceImpactTo = priceImpactTo;

    const maxPriceImpact =
      this.priceImpactFrom !== null || this.priceImpactTo !== null
        ? Math.max(this.priceImpactFrom, this.priceImpactTo)
        : null;
    this.priceImpactService.setPriceImpact(maxPriceImpact);
  }

  private setTradeInfoParams(nativeCoinPrice: number): void {
    const trade = this.crossChainFormService.selectedTrade.trade;
    const tradeInfo = trade.getTradeInfo();
    this.twoWaySwap = !(trade instanceof CelerCrossChainTrade);
    this.estimateGasInEth = tradeInfo.estimatedGas;
    this.estimateGasInUsd = this.estimateGasInEth?.multipliedBy(nativeCoinPrice);
    if (tradeInfo.slippage) {
      if ('total' in tradeInfo.slippage) {
        this.slippage = tradeInfo.slippage.total;
      } else {
        this.slippage = tradeInfo.slippage?.from + tradeInfo.slippage?.to;
      }
    } else {
      this.slippage = 0;
    }

    this.minimumReceived = trade.toTokenAmountMin.multipliedBy(1 - this.slippage / 100);
    this.feeInfo = tradeInfo.feeInfo;
    this.nativeCoinDecimals = nativeTokensList[trade.from.blockchain].decimals;

    if (tradeInfo.priceImpact) {
      if ('total' in tradeInfo.priceImpact) {
        this.priceImpact = tradeInfo.priceImpact.total;
        this.priceImpactService.setPriceImpact(this.priceImpact);
      } else {
        this.setTwoWayPriceImpact(tradeInfo.priceImpact.from, tradeInfo.priceImpact.to);
      }
    } else {
      this.priceImpact = 0;
    }

    this.isBridgers =
      trade instanceof EvmBridgersCrossChainTrade || trade instanceof TronBridgersCrossChainTrade;
  }
}
