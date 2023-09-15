import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { ModalService } from '@core/modals/services/modal.service';
import { FormType } from '@features/swaps/shared/models/form/form-type';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import BigNumber from 'bignumber.js';
import { SwapsControllerService } from '@features/trade/services/swaps-controller/swaps-controller.service';
import { map } from 'rxjs/operators';
import { SwapFormQueryService } from '@features/trade/services/swap-form-query/swap-form-query.service';
import { DOCUMENT } from '@angular/common';
import { TradeProvider } from '@features/swaps/shared/models/trade-provider/trade-provider';
import { Asset } from '@features/swaps/shared/models/form/asset';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';

@Component({
  selector: 'app-trade-page',
  templateUrl: './trade-page.component.html',
  styleUrls: ['./trade-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(-25%)', opacity: 0.5 }),
        animate('0.2s ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0)', opacity: 0.5, width: '360px' }),
        animate('0.22s ease-in', style({ transform: 'translateX(-25%)', opacity: 0, width: 0 }))
      ])
    ])
  ]
})
export class TradePageComponent {
  public readonly formContent$ = this.tradePageService.formContent$;

  public readonly fromAsset$ = this.swapFormService.fromToken$;

  public readonly toAsset$ = this.swapFormService.toToken$;

  public readonly fromAmount$ = this.swapFormService.fromAmount$;

  public readonly toAmount$ = this.swapFormService.toAmount$;

  public isExpanded = false;

  public readonly providers$ = this.swapsState.tradesStore$.pipe(
    map(providers => providers.filter(provider => provider.trade))
  );

  public readonly showProviders$ = this.providers$.pipe(map(providers => providers.length > 0));

  public readonly selectedTradeType$ = this.swapsState.tradeState$.pipe(map(el => el.tradeType));

  private selectedAsset: TokenAmount;

  constructor(
    private readonly modalService: ModalService,
    private readonly swapFormService: SwapsFormService,
    private readonly swapsState: SwapsStateService,
    private readonly swapsControllerService: SwapsControllerService,
    private readonly swapFormQueryService: SwapFormQueryService,
    @Inject(DOCUMENT) private readonly document: Document,
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

  public openTokensSelect(formType: FormType): void {
    this.tradePageService.setState(formType === 'from' ? 'fromSelector' : 'toSelector');
  }

  public updateInputValue(formattedAmount: BigNumber): void {
    if (!formattedAmount?.isNaN()) {
      this.swapFormService.inputControl.patchValue({
        fromAmount: new BigNumber(formattedAmount)
      });
    }
  }

  public async selectTrade(tradeType: TradeProvider): Promise<void> {
    await this.swapsState.selectTrade(tradeType);
    this.getSwapPreview();
  }

  public getSwapPreview(): void {
    this.tradePageService.setState('preview');
  }

  public backToForm(): void {
    this.tradePageService.setState('form');
  }
}
