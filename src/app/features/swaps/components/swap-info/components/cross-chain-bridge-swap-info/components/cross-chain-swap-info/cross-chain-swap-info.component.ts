import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Self } from '@angular/core';
import { SwapFormService } from '@features/swaps/services/swaps-form-service/swap-form.service';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { CrossChainRoutingService } from '@features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import { first, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { TokenAmount } from '@shared/models/tokens/TokenAmount';
import BigNumber from 'bignumber.js';
import { SettingsService } from '@features/swaps/services/settings-service/settings.service';
import { SwapInfoService } from '@features/swaps/components/swap-info/services/swap-info.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { forkJoin, from, of } from 'rxjs';
import { PERMITTED_PRICE_DIFFERENCE } from '@shared/constants/common/PERMITTED_PRICE_DIFFERENCE';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';
import { CrossChainTradeInfo } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/CrossChainTradeInfo';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';

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

  public cryptoFeeInEth: number;

  public cryptoFeeInUsd: BigNumber;

  public feePercent: number;

  public feeAmount: BigNumber;

  public feeTokenSymbol: string;

  public maximumSent: BigNumber;

  public minimumReceived: BigNumber;

  public priceImpactFrom: number;

  public priceImpactTo: number;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapInfoService: SwapInfoService,
    private readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService,
    private readonly crossChainRoutingService: CrossChainRoutingService,
    private readonly tokensService: TokensService,
    private readonly priceImpactService: PriceImpactService,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.subscribeOnInputValue();
    this.subscribeOnOutputValue();
    this.subscribeOnSlippage();
  }

  private subscribeOnInputValue(): void {
    this.swapFormService.inputValueChanges
      .pipe(startWith(this.swapFormService.inputValue), takeUntil(this.destroy$))
      .subscribe(form => {
        this.fromToken = form.fromToken;
        this.toToken = form.toToken;

        this.cdr.markForCheck();
      });
  }

  /**
   * Subscribes on output form value, and after change gets info from cross chain service to update trade info.
   */
  private subscribeOnOutputValue(): void {
    this.swapFormService.outputValueChanges
      .pipe(
        switchMap(form => {
          const { toAmount } = form;
          if (!toAmount?.isFinite()) {
            this.swapInfoService.emitInfoCalculated();
            return of(null);
          }

          const { fromBlockchain } = this.swapFormService.inputValue;
          return forkJoin([
            this.tokensService.tokens$.pipe(first(tokens => !!tokens.size)),
            from(this.tokensService.getNativeCoinPriceInUsd(fromBlockchain)),
            this.crossChainRoutingService.getTradeInfo()
          ]).pipe(
            map(([tokens, nativeCoinPrice, tradeInfo]) => {
              const blockchainAdapter = this.publicBlockchainAdapterService[fromBlockchain];
              this.nativeCoinSymbol = tokens.find(
                token =>
                  token.blockchain === fromBlockchain &&
                  blockchainAdapter?.isNativeAddress(token.address)
              ).symbol;
              this.setTradeInfoParameters(tradeInfo, nativeCoinPrice);

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
   * Sets parameters of currently selected ccr trade.
   */
  private setTradeInfoParameters(tradeInfo: CrossChainTradeInfo, nativeCoinPrice: number): void {
    this.estimateGasInEth = tradeInfo.estimatedGas;
    this.estimateGasInUsd = this.estimateGasInEth?.multipliedBy(nativeCoinPrice);

    this.cryptoFeeInEth = tradeInfo.cryptoFee;
    this.cryptoFeeInUsd = new BigNumber(this.cryptoFeeInEth).multipliedBy(nativeCoinPrice);

    this.feePercent = tradeInfo.feePercent;
    this.feeAmount = tradeInfo.feeAmount;
    this.feeTokenSymbol = tradeInfo.feeTokenSymbol;

    this.setPriceImpact(tradeInfo);

    this.calculateMaxSentAndMinReceived();
  }

  /**
   * Sets from and to price impacts and sets maximum as current price impact.
   */
  private setPriceImpact(tradeInfo: CrossChainTradeInfo): void {
    this.priceImpactFrom = tradeInfo.priceImpactFrom;
    if (this.priceImpactFrom < -PERMITTED_PRICE_DIFFERENCE * 100) {
      this.priceImpactFrom = null;
    }
    this.priceImpactTo = tradeInfo.priceImpactTo;
    if (this.priceImpactTo < -PERMITTED_PRICE_DIFFERENCE * 100) {
      this.priceImpactTo = null;
    }

    const maxPriceImpact =
      this.priceImpactFrom !== null || this.priceImpactTo !== null
        ? Math.max(this.priceImpactFrom, this.priceImpactTo)
        : null;
    this.priceImpactService.setPriceImpact(maxPriceImpact);
  }

  private subscribeOnSlippage(): void {
    this.settingsService.crossChainRoutingValueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const { toAmount } = this.swapFormService.outputValue;
        if (toAmount?.isFinite()) {
          this.calculateMaxSentAndMinReceived();
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Calculates maximum spent and minimum received amounts based on slippage.
   */
  private calculateMaxSentAndMinReceived(): void {
    this.minimumReceived = this.crossChainRoutingService.calculateTokenOutAmountMin();
    this.maximumSent = this.crossChainRoutingService.calculateTokenInAmountMax();
  }
}
