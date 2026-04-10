import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Optional,
  Output
} from '@angular/core';
import { FormType } from '@features/trade/models/form-type';
import { Asset } from '@features/trade/models/asset';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { HeaderStore } from '@core/header/services/header.store';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { DOCUMENT } from '@angular/common';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';

@Component({
  selector: 'app-token-selector-page',
  templateUrl: './token-selector-page.component.html',
  styleUrls: ['./token-selector-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokenSelectorPageComponent {
  @Input({ required: true }) formType: FormType = 'from';

  @Output() tokenSelected: EventEmitter<Asset> = new EventEmitter();

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  constructor(
    @Optional()
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, { formType: FormType }>,
    private readonly headerStore: HeaderStore,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly swapFormService: SwapsFormService,
    private readonly tradePageService: TradePageService
  ) {
    this.formType = this.context?.data?.formType;
  }

  public handleTokenSelect(asset: Asset): void {
    if (this.headerStore.isMobile) {
      const token = asset as BalanceToken;
      if (token) {
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
    } else {
      this.tokenSelected.emit(asset);
    }
  }
}
