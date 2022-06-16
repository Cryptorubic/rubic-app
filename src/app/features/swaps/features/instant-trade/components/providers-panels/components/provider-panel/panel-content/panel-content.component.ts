import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Self
} from '@angular/core';
import { TradePanelData } from '@features/swaps/features/instant-trade/components/providers-panels/components/provider-panel/models/trade-panel-data';
import { ProviderPanelData } from '@features/swaps/features/instant-trade/components/providers-panels/components/provider-panel/models/provider-panel-data';
import BigNumber from 'bignumber.js';
import { PERMITTED_PRICE_DIFFERENCE } from '@shared/constants/common/permited-price-difference';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { startWith, takeUntil } from 'rxjs/operators';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';

@Component({
  selector: 'app-panel-content',
  templateUrl: './panel-content.component.html',
  styleUrls: ['./panel-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class PanelContentComponent implements OnInit {
  @Input() public tradePanelData: TradePanelData;

  @Input() public providerPanelData: ProviderPanelData;

  @Input() public isBestProvider: boolean;

  public displayGas: boolean;

  private toToken: TokenAmount;

  public get usdPrice(): BigNumber {
    if (!this.toToken?.price || !this.tradePanelData?.amount) {
      return null;
    }

    const { fromToken, fromAmount } = this.swapFormService.inputValue;
    const fromTokenCost = fromAmount.multipliedBy(fromToken.price);
    const toTokenCost = this.tradePanelData.amount.multipliedBy(this.toToken.price);
    if (toTokenCost.minus(fromTokenCost).dividedBy(fromTokenCost).gt(PERMITTED_PRICE_DIFFERENCE)) {
      return null;
    }
    return toTokenCost;
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapFormService: SwapFormService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.displayGas = this.tradePanelData?.blockchain === BLOCKCHAIN_NAME.ETHEREUM;

    this.swapFormService.inputValueChanges
      .pipe(startWith(this.swapFormService.inputValue), takeUntil(this.destroy$))
      .subscribe(form => {
        const { toToken } = form;
        if (this.toToken?.price !== toToken?.price) {
          this.toToken = toToken;
          this.cdr.markForCheck();
        }
      });
  }
}
