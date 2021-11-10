import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Self } from '@angular/core';
import { SwapFormService } from '@features/swaps/services/swaps-form-service/swap-form.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { CrossChainRoutingService } from '@features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import { first, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { TokenAmount } from '@shared/models/tokens/TokenAmount';
import BigNumber from 'bignumber.js';
import { SettingsService } from '@features/swaps/services/settings-service/settings.service';
import { SwapInfoService } from '@features/swaps/components/swap-info/services/swap-info.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { forkJoin, from, of } from 'rxjs';
import { Web3Public } from '@core/services/blockchain/web3/web3-public-service/Web3Public';
import { PERMITTED_PRICE_DIFFERENCE } from '@shared/constants/common/PERMITTED_PRICE_DIFFERENCE';

@Component({
  selector: 'app-ccr-swap-info',
  templateUrl: './ccr-swap-info.component.html',
  styleUrls: ['./ccr-swap-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class CcrSwapInfoComponent implements OnInit {
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
              this.nativeCoinSymbol = tokens.find(token =>
                Web3Public.isNativeAddress(token.address)
              ).symbol;

              this.estimateGasInEth = tradeInfo.estimatedGas;
              this.estimateGasInUsd = this.estimateGasInEth?.multipliedBy(nativeCoinPrice);

              this.cryptoFeeInEth = tradeInfo.cryptoFee;
              this.cryptoFeeInUsd = new BigNumber(this.cryptoFeeInEth).multipliedBy(
                nativeCoinPrice
              );

              this.feePercent = tradeInfo.feePercent;
              this.feeAmount = tradeInfo.feeAmount;
              this.feeTokenSymbol = tradeInfo.feeTokenSymbol;

              this.priceImpactFrom = tradeInfo.priceImpactFrom;
              if (this.priceImpactFrom < -PERMITTED_PRICE_DIFFERENCE * 100) {
                this.priceImpactFrom = null;
              }
              this.priceImpactTo = tradeInfo.priceImpactTo;
              if (this.priceImpactTo < -PERMITTED_PRICE_DIFFERENCE * 100) {
                this.priceImpactTo = null;
              }

              this.calculateMaxSentAndMinReceived();

              this.swapInfoService.emitInfoCalculated();
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.cdr.markForCheck();
      });
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
    const slippage = this.settingsService.crossChainRoutingValue.slippageTolerance;

    const slippageFrom = new BigNumber(100).plus(slippage).dividedBy(100);
    const { fromAmount } = this.swapFormService.inputValue;
    this.maximumSent = fromAmount.multipliedBy(slippageFrom);

    const secondTo = new BigNumber(100).minus(slippage).dividedBy(100);
    const { toAmount } = this.swapFormService.outputValue;
    this.minimumReceived = toAmount.multipliedBy(secondTo);
  }
}
