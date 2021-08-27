import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SwapsService } from 'src/app/features/swaps/services/swaps-service/swaps.service';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { CrossChainRoutingService } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import BigNumber from 'bignumber.js';
import { SettingsService } from 'src/app/features/swaps/services/settings-service/settings.service';

type CrossChainSwapInfo = {
  maximumSpent: BigNumber;
  minimumReceived: BigNumber;
  platformFee: number;
};

@Component({
  selector: 'app-swap-info',
  templateUrl: './swap-info.component.html',
  styleUrls: ['./swap-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SwapInfoComponent implements OnInit {
  public fromToken: TokenAmount;

  public toToken: TokenAmount;

  public crossChainSwapInfo: CrossChainSwapInfo;

  public isSwapInfoLoading: boolean;

  public get isCrossChainRouting(): boolean {
    return this.swapsService.swapMode === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;
  }

  public get allowTrade(): boolean {
    const form = this.swapFormService.inputValue;
    return Boolean(
      form.fromAmount &&
        form.fromAmount.gt(0) &&
        form.fromBlockchain &&
        form.toBlockchain &&
        form.fromToken &&
        form.toToken
    );
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapsService: SwapsService,
    private readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService,
    private readonly crossChainRoutingService: CrossChainRoutingService,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.swapFormService.inputValueChanges
      .pipe(startWith(this.swapFormService.inputValue), takeUntil(this.destroy$))
      .subscribe(form => {
        this.isSwapInfoLoading = true;
        this.fromToken = form.fromToken;
        this.toToken = form.toToken;
        this.cdr.detectChanges();
      });

    this.swapFormService.outputValueChanges
      .pipe(
        switchMap(form => {
          if (
            this.swapsService.swapMode === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING &&
            form.toAmount &&
            !form.toAmount.isNaN()
          ) {
            const firstSlippage =
              1 + this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
            const { fromAmount } = this.swapFormService.inputValue;
            const maximumSpent = fromAmount.multipliedBy(firstSlippage);

            const secondSlippage =
              1 - this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
            const minimumReceived = form.toAmount.multipliedBy(secondSlippage);

            return this.crossChainRoutingService.getFeeAmountInPercents().then(platformFee => {
              this.crossChainSwapInfo = {
                maximumSpent,
                minimumReceived,
                platformFee
              };
              this.isSwapInfoLoading = false;
              this.cdr.detectChanges();
            });
          }
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}
