import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Self } from '@angular/core';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { SwapInfoService } from '@features/swaps/features/swaps-form/components/swap-info/services/swap-info.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { forkJoin, from, of } from 'rxjs';
import { PERMITTED_PRICE_DIFFERENCE } from '@shared/constants/common/permited-price-difference';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';
import {
  CelerRubicTradeInfo,
  SymbiosisTradeInfo
} from '@features/swaps/features/cross-chain/services/cross-chain-form-service/models/cross-chain-trade-info';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import {
  LifiCrossChainTrade,
  RangoCrossChainTrade,
  OnChainTradeType,
  Web3Pure,
  BlockchainsInfo as SdkBlockchainsInfo,
  TronBridgersCrossChainTrade,
  EvmBridgersCrossChainTrade,
  SymbiosisCrossChainTrade,
  DebridgeCrossChainTrade,
  ViaCrossChainTrade,
  DexMultichainCrossChainTrade
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

  public cryptoFeeInEth: number;

  public cryptoFeeInUsd: BigNumber;

  public feePercent: number;

  public feeAmount: BigNumber;

  public feeTokenSymbol: string;

  public minimumReceived: BigNumber;

  public priceImpact: number;

  public priceImpactFrom: number;

  public priceImpactTo: number;

  private fromProvider: OnChainTradeType;

  private toProvider: OnChainTradeType;

  public fromPath: string[] | null;

  public toPath: string[] | null;

  public slippage: number;

  public usingCelerBridge: boolean;

  public isSymbiosisOrLifi: boolean;

  public symbiosisOrLifiCryptoFee: BigNumber;

  public symbiosisOrLifiCryptoFeeSymbol: string;

  public isBridgers: boolean;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapInfoService: SwapInfoService,
    private readonly swapFormService: SwapFormService,
    private readonly crossChainFormService: CrossChainFormService,
    private readonly settingsService: SettingsService,
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
          const tokens = this.tokensService.tokens;

          return forkJoin([
            from(this.tokensService.getNativeCoinPriceInUsd(fromBlockchain)),
            this.crossChainFormService.getTradeInfo()
          ]).pipe(
            map(([nativeCoinPrice, tradeInfo]) => {
              const nativeToken = tokens.find(
                token =>
                  token.blockchain === fromBlockchain &&
                  Web3Pure[SdkBlockchainsInfo.getChainType(token.blockchain)].isNativeAddress(
                    token.address
                  )
              );

              this.nativeCoinSymbol = nativeToken.symbol;

              const trade = this.crossChainFormService.selectedTrade.trade;

              if (
                trade instanceof SymbiosisCrossChainTrade ||
                trade instanceof LifiCrossChainTrade ||
                trade instanceof DebridgeCrossChainTrade ||
                trade instanceof ViaCrossChainTrade ||
                trade instanceof RangoCrossChainTrade ||
                trade instanceof EvmBridgersCrossChainTrade ||
                trade instanceof TronBridgersCrossChainTrade ||
                trade instanceof DexMultichainCrossChainTrade
              ) {
                this.isSymbiosisOrLifi = true;

                this.estimateGasInEth = tradeInfo.estimatedGas;
                this.estimateGasInUsd = this.estimateGasInEth?.multipliedBy(nativeCoinPrice);

                if (trade instanceof DexMultichainCrossChainTrade && !trade.onChainTrade) {
                  this.slippage = 0;
                } else {
                  this.slippage = this.settingsService.crossChainRoutingValue.slippageTolerance;
                }
                this.minimumReceived = toAmount.multipliedBy(1 - this.slippage / 100);

                this.setSymbiosisOrLifiTradeInfoParameters(tradeInfo as SymbiosisTradeInfo);
              } else {
                this.isSymbiosisOrLifi = false;

                this.setCelerRubicTradeInfoParameters(
                  tradeInfo as CelerRubicTradeInfo,
                  nativeCoinPrice
                );
              }

              this.isBridgers =
                trade instanceof EvmBridgersCrossChainTrade ||
                trade instanceof TronBridgersCrossChainTrade;

              this.swapInfoService.emitInfoCalculated();
            })
          );
        }),
        watch(this.cdr),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private setSymbiosisOrLifiTradeInfoParameters(tradeInfo: SymbiosisTradeInfo): void {
    this.priceImpact = parseFloat(tradeInfo.priceImpact);
    this.priceImpactService.setPriceImpact(this.priceImpact);

    this.symbiosisOrLifiCryptoFee = tradeInfo.networkFee;
    this.symbiosisOrLifiCryptoFeeSymbol = tradeInfo.networkFeeSymbol;

    this.feePercent = tradeInfo.feePercent;
    this.feeAmount = tradeInfo.feeAmount;
    this.feeTokenSymbol = tradeInfo.feeTokenSymbol;
  }

  /**
   * Sets parameters of currently selected ccr trade.
   */
  private setCelerRubicTradeInfoParameters(
    tradeInfo: CelerRubicTradeInfo,
    nativeCoinPrice: number
  ): void {
    this.estimateGasInEth = tradeInfo.estimatedGas;
    this.estimateGasInUsd = this.estimateGasInEth?.multipliedBy(nativeCoinPrice);

    this.cryptoFeeInEth = tradeInfo.cryptoFee;
    this.cryptoFeeInUsd = new BigNumber(this.cryptoFeeInEth).multipliedBy(nativeCoinPrice);
    this.feePercent = tradeInfo.feePercent;
    this.feeAmount = tradeInfo.feeAmount;
    this.feeTokenSymbol = tradeInfo.feeTokenSymbol;

    this.setPriceImpact(tradeInfo);

    this.fromProvider = tradeInfo.fromProvider;
    this.toProvider = tradeInfo.toProvider;

    this.fromPath = tradeInfo.fromPath;
    this.toPath = tradeInfo.toPath;

    this.minimumReceived = this.crossChainFormService.selectedTrade.trade.toTokenAmountMin;
    this.slippage = this.settingsService.crossChainRoutingValue.slippageTolerance;

    this.usingCelerBridge = tradeInfo.usingCelerBridge;
  }

  /**
   * Sets from and to price impacts and sets maximum as current price impact.
   */
  private setPriceImpact(tradeInfo: CelerRubicTradeInfo): void {
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
    this.swapButtonService.setupPriceImpactCalculation();
  }
}
