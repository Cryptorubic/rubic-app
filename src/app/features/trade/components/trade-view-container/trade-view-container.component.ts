import { ChangeDetectionStrategy, Component, Inject, Renderer2 } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { map, tap } from 'rxjs/operators';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { SwapFormQueryService } from '@features/trade/services/swap-form-query/swap-form-query.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { BlockchainName, ON_CHAIN_TRADE_TYPE } from '@cryptorubic/core';
import { TradeState } from '@features/trade/models/trade-state';
import { firstValueFrom } from 'rxjs';
import { HeaderStore } from '@core/header/services/header.store';
import { ActionButtonService } from '@features/trade/services/action-button-service/action-button.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { PreviewSwapService } from '../../services/preview-swap/preview-swap.service';
import { QueryParamsService } from '@app/core/services/query-params/query-params.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { ChartService } from '../../services/chart-service/chart.service';
import { Asset } from '../../models/asset';
import { FormType } from '../../models/form-type';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { DOCUMENT } from '@angular/common';
import { FormsTogglerService } from '../../services/forms-toggler/forms-toggler.service';

@Component({
  standalone: false,
  selector: 'app-trade-view-container',
  templateUrl: './trade-view-container.component.html',
  styleUrls: ['./trade-view-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [
        style({ opacity: 0, scale: 0 }),
        animate('0.25s ease-in-out', style({ opacity: 1, scale: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 0.5, width: '360px', scale: 1 }),
        animate('0.25s ease-in-out', style({ opacity: 0, width: 0, scale: 0 }))
      ])
    ])
  ]
})
export class TradeViewContainerComponent {
  public readonly formContent$ = this.tradePageService.formContent$;

  public readonly providers$ = this.swapsState.tradesStore$.pipe(
    tap(providers => this.setProvidersVisibility(providers)),
    map(providers => providers.filter(provider => provider.trade))
  );

  public readonly calculationStatus$ = this.swapsState.calculationStatus$;

  public readonly selectedTradeType$ = this.swapsState.tradeState$.pipe(map(el => el.tradeType));

  public readonly mobile$ = this.headerStore.getMobileDisplayStatus();

  public readonly useLargeIframe = this.queryParamsService.useLargeIframe;

  public readonly buttonState$ = this.actionButtonService.buttonState$;

  public readonly transactionState$ = this.previewSwapService.transactionState$;

  private readonly hideIframeBanner =
    this.queryParamsService.hideBranding && this.queryParamsService.useLargeIframe;

  public readonly chartInfo$ = this.chartService.chartInfo$;

  public readonly isTransferMode$ = this.formsTogglerService.isTransferMode$;

  constructor(
    private readonly swapsState: SwapsStateService,
    private readonly tradePageService: TradePageService,
    public readonly swapFormQueryService: SwapFormQueryService,
    public readonly swapFormService: SwapsFormService,
    private readonly headerStore: HeaderStore,
    private readonly previewSwapService: PreviewSwapService,
    private readonly actionButtonService: ActionButtonService,
    private readonly notificationsService: NotificationsService,
    private readonly queryParamsService: QueryParamsService,
    private readonly authService: AuthService,
    private readonly chartService: ChartService,
    private readonly formsTogglerService: FormsTogglerService,
    renderer2: Renderer2,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.chartService.setRenderer(renderer2);
    this.chartService.initSubscriptions(swapFormService);
  }

  public async selectTrade(tradeType: TradeProvider): Promise<void> {
    await this.swapsState.selectTrade(tradeType);
    await this.getSwapPreview();
  }

  public async getSwapPreview(): Promise<void> {
    const buttonStatus = await firstValueFrom(this.buttonState$);
    if (buttonStatus.text === 'Preview swap') {
      buttonStatus.action();
    } else if (buttonStatus.type === 'error' || buttonStatus.text === 'Connect wallet') {
      this.notificationsService.show(buttonStatus.text, {
        appearance: 'warning',
        autoClose: 5_000,
        data: null
      });
    }
  }

  public handleTokenSelect(asset: Asset, formType: FormType): void {
    const token = asset as BalanceToken;
    if (token) {
      const inputElement = this.document.getElementById('token-amount-input-element');
      const isFromAmountEmpty = !this.swapFormService.inputValue.fromAmount?.actualValue.isFinite();

      if (inputElement && isFromAmountEmpty) {
        setTimeout(() => {
          inputElement.focus();
        }, 0);
      }

      if (formType === 'from') {
        const patch: {
          fromBlockchain: BlockchainName;
          fromToken: BalanceToken;
          toBlockchain?: BlockchainName;
          toToken?: BalanceToken;
        } = {
          fromBlockchain: token.blockchain,
          fromToken: token
        };
        if (this.formsTogglerService.isTransferMode) {
          patch.toToken = token;
          patch.toBlockchain = token.blockchain;
        }
        this.swapFormService.inputControl.patchValue(patch);
      } else {
        this.swapFormService.inputControl.patchValue({
          toToken: token,
          toBlockchain: token.blockchain
        });
      }
    }
    this.tradePageService.setState('form');
  }

  private setProvidersVisibility(providers: TradeState[]): void {
    if (this.swapFormService.isFilled) {
      let timeout: ReturnType<typeof setTimeout> | undefined;
      if (providers.length === 0) {
        timeout = setTimeout(() => {
          this.tradePageService.setProvidersVisibility(true);
          clearTimeout(timeout);
        }, 1_500);
      } else if (providers[0].trade?.type === ON_CHAIN_TRADE_TYPE.WRAPPED) {
        if (timeout) {
          clearTimeout(timeout);
        }
        this.tradePageService.setProvidersVisibility(false);
      } else if (providers.length > 0) {
        this.tradePageService.setProvidersVisibility(true);
        if (timeout) {
          clearTimeout(timeout);
        }
      } else {
        if (!timeout) {
          this.tradePageService.setProvidersVisibility(false);
        }
      }
    }
  }
}
