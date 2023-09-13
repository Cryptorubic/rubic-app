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
import { BehaviorSubject } from 'rxjs';
import { Asset } from '@features/swaps/shared/models/form/asset';

@Component({
  selector: 'app-trade-page',
  templateUrl: './trade-page.component.html',
  styleUrls: ['./trade-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [
        style({ width: 0, opacity: 0.5 }),
        animate('0.1s ease-out', style({ width: 400, opacity: 1 }))
      ]),
      transition(':leave', [
        style({ width: 400, opacity: 1 }),
        animate('0.1s ease-in', style({ width: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class TradePageComponent {
  private readonly _formContent$ = new BehaviorSubject<'form' | 'fromSelector' | 'toSelector'>(
    'form'
  );

  public readonly formContent$ = this._formContent$.asObservable();

  public readonly fromAsset$ = this.swapFormService.fromToken$;

  public readonly toAsset$ = this.swapFormService.toToken$;

  public readonly fromAmount$ = this.swapFormService.fromAmount$;

  public readonly toAmount$ = this.swapFormService.toAmount$;

  public isExpanded = false;

  public readonly providers$ = this.swapsState.tradesStore$.pipe(
    map(providers => providers.filter(provider => provider.trade))
  );

  public readonly showProviders$ = this.providers$.pipe(map(providers => providers.length > 1));

  public readonly selectedTradeType$ = this.swapsState.tradeState$.pipe(map(el => el.tradeType));

  private selectedAsset: TokenAmount;

  constructor(
    private readonly modalService: ModalService,
    private readonly swapFormService: SwapsFormService,
    private readonly swapsState: SwapsStateService,
    private readonly swapsControllerService: SwapsControllerService,
    private readonly swapFormQueryService: SwapFormQueryService,
    @Inject(DOCUMENT) private readonly document: Document
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
    this._formContent$.next('form');
  }

  public openTokensSelect(formType: FormType): void {
    this._formContent$.next(formType === 'from' ? 'fromSelector' : 'toSelector');
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
  }
}
