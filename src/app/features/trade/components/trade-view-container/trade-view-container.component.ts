import { ChangeDetectionStrategy, Component, Renderer2 } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { combineLatestWith, delay, map, startWith, switchMap, tap } from 'rxjs/operators';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { SwapFormQueryService } from '@features/trade/services/swap-form-query/swap-form-query.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { ON_CHAIN_TRADE_TYPE } from '@cryptorubic/sdk';
import { SwapTokensUpdaterService } from '@features/trade/services/swap-tokens-updater-service/swap-tokens-updater.service';
import { TradeState } from '@features/trade/models/trade-state';
import { concat, firstValueFrom, fromEvent, of } from 'rxjs';
import { HeaderStore } from '@core/header/services/header.store';
import { ActionButtonService } from '@features/trade/services/action-button-service/action-button.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { TuiNotification } from '@taiga-ui/core';
import { PreviewSwapService } from '../../services/preview-swap/preview-swap.service';
import { QueryParamsService } from '@app/core/services/query-params/query-params.service';
import { SpindlService } from '@app/core/services/spindl-ads/spindl.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { ChartService } from '../../services/chart-service/chart.service';
import { SolanaGaslessService } from '../../services/solana-gasless/solana-gasless.service';

@Component({
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

  public readonly showSpindl$ = this.spindlService.showSpindl$.pipe(
    combineLatestWith(this.authService.currentUser$),
    map(([showSpindl, currUser]) => showSpindl && Boolean(currUser?.address)),
    map(showSpindl => (this.hideIframeBanner ? false : showSpindl))
  );

  public readonly showHypelab$ = fromEvent<MessageEvent>(window, 'message').pipe(
    map(e => e.data?.type === 'bannerReady'),
    startWith(false)
  );

  public readonly resetCarouselDuration$ = this.authService.currentUser$.pipe(
    switchMap(() => concat(of(0), of(60000).pipe(delay(100))))
  );

  public readonly resetCarouselIndex$ = this.authService.currentUser$.pipe(switchMap(() => of(0)));

  public readonly chartInfo$ = this.chartService.chartInfo$;

  constructor(
    private readonly swapsState: SwapsStateService,
    private readonly tradePageService: TradePageService,
    public readonly swapFormQueryService: SwapFormQueryService,
    public readonly swapFormService: SwapsFormService,
    public readonly swapTokensUpdaterService: SwapTokensUpdaterService,
    private readonly headerStore: HeaderStore,
    private readonly previewSwapService: PreviewSwapService,
    private readonly actionButtonService: ActionButtonService,
    private readonly notificationsService: NotificationsService,
    private readonly queryParamsService: QueryParamsService,
    private readonly spindlService: SpindlService,
    private readonly authService: AuthService,
    private readonly chartService: ChartService,
    private readonly solanaGaslessService: SolanaGaslessService,
    renderer2: Renderer2
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
        status: TuiNotification.Warning,
        autoClose: 5_000,
        data: null,
        icon: '',
        defaultAutoCloseTime: 0
      });
    }
  }

  private setProvidersVisibility(providers: TradeState[]): void {
    if (this.swapFormService.isFilled) {
      let timeout: NodeJS.Timeout;
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

  ngAfterViewInit() {
    // tui-carousel stop scrolling and reset duration when mouse enter on element
    const carousel = document.querySelector('.banner-carousel');

    if (carousel) {
      carousel.removeAllListeners('mouseenter');
      carousel.removeAllListeners('mouseleave');
    }
  }
}
