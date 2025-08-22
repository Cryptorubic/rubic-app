import { Inject, Injectable, Renderer2 } from '@angular/core';
import { SwapsFormService } from '../swaps-form/swaps-form.service';
import { BehaviorSubject, distinctUntilChanged, map, takeUntil } from 'rxjs';
import { ChartInfo, ChartSize } from './models';
import { HeaderStore } from '@app/core/header/services/header.store';
import { DOCUMENT } from '@angular/common';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { compareTokens } from '@app/shared/utils/utils';
import { compareAssets } from '../../utils/compare-assets';
import { TradePageService } from '../trade-page/trade-page.service';
import { GoogleTagManagerService } from '@app/core/services/google-tag-manager/google-tag-manager.service';

@Injectable()
export class ChartService {
  private readonly _chartInfo$ = new BehaviorSubject<ChartInfo>({
    size: { height: 250, width: 600 },
    status: { loaded: false, opened: false, lastOpened: false, forceClosed: false }
  });

  public readonly chartInfo$ = this._chartInfo$.asObservable();

  public readonly chartVisibilty$ = this.chartInfo$.pipe(
    map(info => info.status.opened),
    distinctUntilChanged()
  );

  public get chartInfo(): ChartInfo {
    return this._chartInfo$.value;
  }

  private renderer: Renderer2 | null = null;

  private script: HTMLScriptElement | null = null;

  constructor(
    private readonly swapsFormService: SwapsFormService,
    private readonly headerStore: HeaderStore,
    private readonly tradePageService: TradePageService,
    private readonly gtmService: GoogleTagManagerService,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly destroy$: TuiDestroyService
  ) {
    this.initSubscriptions();
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
  public setChartOpened(
    opened: boolean,
    options: { rewriteLastOpened?: boolean; forceClosed?: boolean } = {}
  ): void {
    this._chartInfo$.next({
      size: this._chartInfo$.value.size,
      status: {
        ...this._chartInfo$.value.status,
        ...(options.rewriteLastOpened && { lastOpened: opened }),
        ...(options.forceClosed && { forceClosed: options.forceClosed }),
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

  public initSubscriptions(): void {
    this.swapsFormService.inputValue$
      .pipe(
        distinctUntilChanged(
          (prev, next) =>
            prev.toBlockchain === next.toBlockchain &&
            prev.fromBlockchain === next.fromBlockchain &&
            compareAssets(prev.fromToken, next.fromToken) &&
            compareTokens(prev.toToken, next.toToken)
        ),
        takeUntil(this.destroy$)
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
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(mobile => {
        this.setChartSize(mobile ? { height: 250, width: 360 } : { height: 250, width: 600 });
        const inputValue = this.swapsFormService.inputValue;
        const container = this.document.getElementById(
          'tradingview-widget-container'
        ) as HTMLElement;

        if (inputValue.fromToken && inputValue.toToken && container) {
          this.createAndInvokeScript();
        }
      });

    this.tradePageService.formContent$
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(formContent => {
        if (formContent === 'form' && this.chartInfo.status.lastOpened) {
          this.setChartOpened(true, { rewriteLastOpened: true, forceClosed: false });
        } else {
          this.setChartOpened(false);
        }
      });

    this.chartVisibilty$.pipe(takeUntil(this.destroy$)).subscribe(opened => {
      if (opened)
        this.gtmService.fireOpenChart(
          this.swapsFormService.inputValue.fromToken,
          this.swapsFormService.inputValue.toToken
        );
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
        "trendLineColor": "#00e28d",
        "underLineColor": "#00e28d",
        "lineColor": "#00e28d",
        "topColor": "#00e28d",
        "bottomColor": "#515353ff",
        "maLineColor": "#00e28d",
        "underLineBottomColor": "#3b3d4f",
        "backgroundColor": "#3b3d4f",
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
      // automatically show chart on first load if hidden
      if (!this.chartInfo.status.lastOpened && !this.chartInfo.status.forceClosed) {
        this.setChartOpened(true, { forceClosed: false, rewriteLastOpened: true });
      }
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
            iframe.style.width = this.chartInfo.size.width + 'px';
            observer.disconnect();
          }
        }
      }
    });
    observer.observe(parentNode, { childList: true });
  }
}
