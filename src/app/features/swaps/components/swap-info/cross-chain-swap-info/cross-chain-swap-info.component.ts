import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { CrossChainRoutingService } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import BigNumber from 'bignumber.js';
import { SettingsService } from 'src/app/features/swaps/services/settings-service/settings.service';
import { TRADE_STATUS } from 'src/app/shared/models/swaps/TRADE_STATUS';

type CrossChainSwapInfo = {
  maximumSpent: BigNumber;
  minimumReceived: BigNumber;
  platformFee: {
    percent: number;
    amount: BigNumber;
    amountInUsd: BigNumber;
  };
};

@Component({
  selector: 'app-cross-chain-swap-info',
  templateUrl: './cross-chain-swap-info.component.html',
  styleUrls: ['./cross-chain-swap-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class CrossChainSwapInfoComponent implements OnInit {
  @Input() set tradeStatus(value: TRADE_STATUS) {
    if (value === TRADE_STATUS.LOADING) {
      this.isSwapInfoLoading = true;
    }
  }

  public fromToken: TokenAmount;

  public toToken: TokenAmount;

  public crossChainSwapInfo: CrossChainSwapInfo;

  public isSwapInfoLoading: boolean;

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
    private readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService,
    private readonly crossChainRoutingService: CrossChainRoutingService,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.swapFormService.outputValueChanges
      .pipe(
        switchMap(form => {
          if (form.toAmount?.isFinite()) {
            const firstSlippage =
              1 + this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
            const { fromAmount } = this.swapFormService.inputValue;
            const maximumSpent = fromAmount.multipliedBy(firstSlippage);

            const secondSlippage =
              1 - this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
            const minimumReceived = form.toAmount.multipliedBy(secondSlippage);

            return this.crossChainRoutingService.getFeeAmountData().pipe(
              map(platformFee => {
                this.crossChainSwapInfo = {
                  maximumSpent,
                  minimumReceived,
                  platformFee
                };
                this.fromToken = this.swapFormService.inputValue.fromToken;
                this.toToken = this.swapFormService.inputValue.toToken;
                this.isSwapInfoLoading = false;
                this.cdr.detectChanges();
              })
            );
          }

          this.crossChainSwapInfo = null;
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}
