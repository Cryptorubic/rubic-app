import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Self
} from '@angular/core';
import { TradeData } from '@features/instant-trade/components/providers-panels/components/provider-panel/models/trade-data';
import { ProviderData } from '@features/instant-trade/components/providers-panels/components/provider-panel/models/provider-data';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { ShouldDisplayGas } from '@features/instant-trade/constants/should-display-gas';
import BigNumber from 'bignumber.js';
import { PermitedPriceDifference } from '@shared/constants/common/permited-price-difference';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { SwapFormService } from '@features/swaps/services/swaps-form-service/swap-form.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { startWith, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-panel-content',
  templateUrl: './panel-content.component.html',
  styleUrls: ['./panel-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class PanelContentComponent implements OnInit {
  @Input() public tradeData: TradeData;

  @Input() public providerData: ProviderData;

  @Input() public isBestRate: boolean;

  public blockchains = BLOCKCHAIN_NAME;

  public displayGas: boolean;

  private toToken: TokenAmount;

  public get usdPrice(): BigNumber {
    if (!this.toToken?.price || !this.tradeData.amount) {
      return null;
    }

    const { fromToken, fromAmount } = this.swapFormService.inputValue;
    const fromTokenCost = fromAmount.multipliedBy(fromToken.price);
    const toTokenCost = this.tradeData.amount.multipliedBy(this.toToken.price);
    if (toTokenCost.minus(fromTokenCost).dividedBy(fromTokenCost).gt(PermitedPriceDifference)) {
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
    this.displayGas = ShouldDisplayGas[this.tradeData?.blockchain as keyof typeof ShouldDisplayGas];

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
