import { Inject, Injectable, Renderer2 } from '@angular/core';
import { SwapsFormService } from '../swaps-form/swaps-form.service';
import { BehaviorSubject, distinctUntilChanged, takeUntil } from 'rxjs';
import { ChartInfo, ChartSize } from './models';
import { HeaderStore } from '@app/core/header/services/header.store';
import { DOCUMENT } from '@angular/common';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { compareTokens } from '@app/shared/utils/utils';
import { compareAssets } from '../../utils/compare-assets';
import { WINDOW } from '@ng-web-apis/common';
import { TradePageService } from '../trade-page/trade-page.service';

@Injectable()
export class ChartService {
  private readonly _chartInfo$ = new BehaviorSubject<ChartInfo>({
    size: { height: 250, width: 600 },
    status: { loaded: false, opened: false, lastOpened: false }
  });

  public readonly chartInfo$ = this._chartInfo$.asObservable();

  public get chartInfo(): ChartInfo {
    return this._chartInfo$.value;
  }

  private renderer: Renderer2 | null = null;

  private script: HTMLScriptElement | null = null;

  constructor(
    private readonly swapsFormService: SwapsFormService,
    private readonly headerStore: HeaderStore,
    private readonly tradePageService: TradePageService,
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(WINDOW) private readonly window: Window,
    destroy$: TuiDestroyService
  ) {
    this.swapsFormService.inputValue$
      .pipe(
        distinctUntilChanged(
          (prev, next) =>
            prev.toBlockchain === next.toBlockchain &&
            prev.fromBlockchain === next.fromBlockchain &&
            compareAssets(prev.fromToken, next.fromToken) &&
            compareTokens(prev.toToken, next.toToken)
        ),
        takeUntil(destroy$)
      )
      .subscribe(inputValue => {
        const container = this.document.getElementById(
          'tradingview-widget-container'
        ) as HTMLElement;

        if (inputValue.fromToken && inputValue.toToken && container) {
          this.createAndInvokeScript();
        }
      });

    this.headerStore
      .getMobileDisplayStatus()
      .pipe(distinctUntilChanged(), takeUntil(destroy$))
      .subscribe(mobile => {
        this.setChartSize(
          mobile ? { height: 250, width: this.window.innerWidth - 20 } : { height: 250, width: 600 }
        );
        const inputValue = this.swapsFormService.inputValue;
        const container = this.document.getElementById(
          'tradingview-widget-container'
        ) as HTMLElement;

        if (inputValue.fromToken && inputValue.toToken && container) {
          this.createAndInvokeScript();
        }
      });

    this.tradePageService.formContent$
      .pipe(distinctUntilChanged(), takeUntil(destroy$))
      .subscribe(formContent => {
        if (formContent === 'form' && this.chartInfo.status.lastOpened) {
          this.setChartOpened(true, true);
        } else {
          this.setChartOpened(false);
        }
      });
  }

  /* Invoke only once on app init in any component to get access to renderer object in ChartService */
  public setRenderer(renderer: Renderer2): void {
    if (this.renderer) return;
    this.renderer = renderer;
  }

  /**
   * @param opened set to open/close chart
   * @param rewriteLastOpened stores last manual selection of open/close chart state
   * restores that state after opening 'form' after being in preview swap or in selectors
   */
  public setChartOpened(opened: boolean, rewriteLastOpened?: boolean): void {
    this._chartInfo$.next({
      size: this._chartInfo$.value.size,
      status: {
        ...this._chartInfo$.value.status,
        ...(rewriteLastOpened && { lastOpened: opened }),
        opened
      }
    });
  }

  private setChartLoaded(loaded: boolean): void {
    this._chartInfo$.next({
      size: this._chartInfo$.value.size,
      status: { ...this._chartInfo$.value.status, loaded }
    });
  }

  private setChartSize(size: ChartSize): void {
    this._chartInfo$.next({
      status: this._chartInfo$.value.status,
      size
    });
  }

  public createAndInvokeScript(): void {
    const container = this.document.getElementById('tradingview-widget-container') as HTMLElement;
    const oldChart = container.querySelector('iframe');
    const { fromToken, toToken } = this.swapsFormService.inputValue;

    if (oldChart) oldChart.remove();

    this.script = this.renderer.createElement('script') as HTMLScriptElement;
    this.script.type = 'text/javascript';
    this.script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    this.script.async = true;
    this.script.text = `{
        "symbol": "${this.getChartSymbol(fromToken, toToken)}",
        "style": "3",
        "locale": "en",
        "dateRange": "1D",
        "colorTheme": "dark",
        "theme": "dark",
        "trendLineColor": "rgba(152, 0, 255, 1)",
        "underLineColor": "rgba(152, 0, 255, 1)",
        "underLineBottomColor": "rgba(0, 255, 255, 0)",
        "isTransparent": false,
        "chartOnly": false,
        "noTimeScale": false,
        "height": "${this.chartInfo.size.height}",
        "width": "${this.chartInfo.size.width}",
        "hide_side_toolbar": true,
        "hide_top_toolbar": true,
        "allow_symbol_change": false,
        "calendar": false,
        "details": false
    }`;
    this.script.addEventListener('load', () => {
      this.script.remove();
      this.script = null;
      this.setChartLoaded(true);
    });

    // calls script and creates iframe with TradingView widget
    this.renderer.appendChild(container, this.script);
    this.roundIframeBorderOnLoad(container);
  }

  // @FIX handle symbols USDC.e axelUSDC etc.
  private getChartSymbol(srcToken: { symbol: string }, dstToken: { symbol: string }): string {
    const contains = (substr: string, token: { symbol: string }): boolean => {
      return (
        token.symbol.toLowerCase().startsWith(substr) || token.symbol.toLowerCase().includes(substr)
      );
    };

    if (contains('usdc', srcToken)) return `${dstToken.symbol}USDC`;
    if (contains('usdc', dstToken)) return `${srcToken.symbol}USDC`;
    if (contains('usdt', srcToken)) return `${dstToken.symbol}USDT`;
    if (contains('usdt', dstToken)) return `${srcToken.symbol}USDT`;

    return `${srcToken.symbol}USDT/${dstToken.symbol}USDT`;
  }

  private roundIframeBorderOnLoad(parentNode: HTMLElement): void {
    const observer = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          const iframe = parentNode.querySelector('iframe');
          if (iframe) {
            iframe.style.borderRadius = 'var(--tui-radius-m)';
            observer.disconnect();
          }
        }
      }
    });
    observer.observe(parentNode, { childList: true });
  }
}
