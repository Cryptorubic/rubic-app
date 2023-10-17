import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { DOCUMENT } from '@angular/common';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { FormType } from '@features/trade/models/form-type';
import { Asset } from '@features/trade/models/asset';

@Component({
  selector: 'app-token-selector-page',
  templateUrl: './token-selector-page.component.html',
  styleUrls: ['./token-selector-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokenSelectorPageComponent {
  @Input({ required: true }) type: 'from' | 'to';

  private selectedAsset: TokenAmount;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly swapFormService: SwapsFormService,
    private readonly tradePageService: TradePageService
  ) {}

  public handleTokenSelect(formType: FormType, asset: Asset): void {
    const token = asset as TokenAmount;
    if (token) {
      this.selectedAsset = token;
      const inputElement = this.document.getElementById('token-amount-input-element');
      const isFromAmountEmpty = !this.swapFormService.inputValue.fromAmount?.isFinite();

      if (inputElement && isFromAmountEmpty) {
        setTimeout(() => {
          inputElement.focus();
        }, 0);
      }

      if (formType === 'from') {
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
