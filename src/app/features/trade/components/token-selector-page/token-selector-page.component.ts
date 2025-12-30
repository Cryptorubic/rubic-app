import { ChangeDetectionStrategy, Component, Inject, Input, Optional } from '@angular/core';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { DOCUMENT } from '@angular/common';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { FormType } from '@features/trade/models/form-type';
import { Asset } from '@features/trade/models/asset';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { HeaderStore } from '@core/header/services/header.store';

@Component({
  selector: 'app-token-selector-page',
  templateUrl: './token-selector-page.component.html',
  styleUrls: ['./token-selector-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokenSelectorPageComponent {
  @Input({ required: true }) formType: FormType = 'from';

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  constructor(
    @Optional()
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, { formType: FormType }>,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly swapFormService: SwapsFormService,
    private readonly tradePageService: TradePageService,
    private readonly headerStore: HeaderStore
  ) {
    this.formType = this.context?.data?.formType;
  }

  public handleTokenSelect(asset: Asset): void {
    const token = asset as BalanceToken;
    if (token) {
      const inputElement = this.document.getElementById('token-amount-input-element');
      const isFromAmountEmpty = !this.swapFormService.inputValue.fromAmount?.actualValue.isFinite();

      if (inputElement && isFromAmountEmpty) {
        setTimeout(() => {
          inputElement.focus();
        }, 0);
      }

      if (this.formType === 'from') {
        this.swapFormService.inputControl.patchValue({
          fromBlockchain: token.blockchain,
          fromToken: token
        });
      } else {
        this.swapFormService.inputControl.patchValue({
          toToken: token,
          toBlockchain: token.blockchain
        });
      }
    }
    this.tradePageService.setState('form');
  }

  public backToForm(): void {
    this.tradePageService.setState('form');
  }
}
