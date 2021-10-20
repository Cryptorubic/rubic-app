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
import { PlatformFee } from 'src/app/features/cross-chain-routing/services/cross-chain-routing-service/models/PlatformFee';

type CrossChainSwapInfo = {
  maximumSpent: BigNumber;
  minimumReceived: BigNumber;
  platformFee: PlatformFee;
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
    this.subscribeOnOutputValue();
    this.subscribeOnSlippage();
  }

  private subscribeOnOutputValue(): void {
    this.swapFormService.outputValueChanges
      .pipe(
        switchMap(form => {
          const { toAmount } = form;
          if (toAmount?.isFinite()) {
            return this.crossChainRoutingService.getPlatformFeeData().pipe(
              map(platformFee => {
                this.crossChainSwapInfo = {
                  platformFee,
                  ...this.getMaxSpentAndMinReceived()
                };
                this.fromToken = this.swapFormService.inputValue.fromToken;
                this.toToken = this.swapFormService.inputValue.toToken;
                this.isSwapInfoLoading = false;
              })
            );
          }

          this.crossChainSwapInfo = null;
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.cdr.detectChanges());
  }

  private subscribeOnSlippage(): void {
    this.settingsService.crossChainRoutingValueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const { toAmount } = this.swapFormService.outputValue;
        if (toAmount?.isFinite()) {
          this.crossChainSwapInfo = {
            ...this.crossChainSwapInfo,
            ...this.getMaxSpentAndMinReceived()
          };
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Calculates maximum spent and minimum received amounts based on slippage.
   */
  private getMaxSpentAndMinReceived(): {
    maximumSpent: BigNumber;
    minimumReceived: BigNumber;
  } {
    const slippage = this.settingsService.crossChainRoutingValue.slippageTolerance;

    const slippageFrom = new BigNumber(100).plus(slippage).dividedBy(100);
    const { fromAmount } = this.swapFormService.inputValue;
    const maximumSpent = fromAmount.multipliedBy(slippageFrom);

    const secondTo = new BigNumber(100).minus(slippage).dividedBy(100);
    const { toAmount } = this.swapFormService.outputValue;
    const minimumReceived = toAmount.multipliedBy(secondTo);

    return {
      maximumSpent,
      minimumReceived
    };
  }
}
