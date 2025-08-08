import { Inject, Injectable, Renderer2 } from '@angular/core';
import { SwapsFormService } from '../swaps-form/swaps-form.service';
import { BehaviorSubject, distinctUntilChanged, takeUntil } from 'rxjs';
import { ChartSize } from './models';
import { HeaderStore } from '@app/core/header/services/header.store';
import { DOCUMENT } from '@angular/common';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { compareTokens } from '@app/shared/utils/utils';
import { compareAssets } from '../../utils/compare-assets';

@Injectable()
export class ChartService {
  private readonly _chartSize$ = new BehaviorSubject<ChartSize>({
    height: 250,
    width: 600
  });

  private readonly _showChart$ = new BehaviorSubject(false);

  public readonly chartSize$ = this._chartSize$.asObservable();

  public readonly showChart$ = this._showChart$.asObservable();

  public get chartSize(): ChartSize {
    return this._chartSize$.value;
  }

  private renderer: Renderer2 | null = null;

  private script: HTMLScriptElement | null = null;

  constructor(
    private readonly swapsFormService: SwapsFormService,
    private readonly headerStore: HeaderStore,
    @Inject(DOCUMENT) private readonly document: Document,
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
        this.setChartSize(mobile ? { height: 250, width: 300 } : { height: 250, width: 600 });
        const inputValue = this.swapsFormService.inputValue;
        const container = this.document.getElementById(
          'tradingview-widget-container'
        ) as HTMLElement;
        if (inputValue.fromToken && inputValue.toToken && container) {
          this.createAndInvokeScript();
        }
      });
  }

  /* Invoke only once on app init in any component to get access to renderer object in ChartService */
  public setRenderer(renderer: Renderer2): void {
    if (this.renderer) return;
    this.renderer = renderer;
  }

  public setShowChart(show: boolean): void {
    this._showChart$.next(show);
  }

  private setChartSize(size: ChartSize): void {
    this._chartSize$.next(size);
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
        "height": "${this.chartSize.height}",
        "width": "${this.chartSize.width}"
    }`;
    this.script.addEventListener('load', () => {
      this.script.remove();
      this.script = null;
      this.setShowChart(true);
    });

    // calls script and creates iframe with TradingView widget
    this.renderer.appendChild(container, this.script);
  }

  // @FIX handle symbols USDC.e axelUSDC etc.
  private getChartSymbol(srcToken: { symbol: string }, dstToken: { symbol: string }): string {
    if (srcToken.symbol.toLowerCase().startsWith('usdc')) {
      return `${dstToken.symbol}USDC`;
    }
    if (dstToken.symbol.toLowerCase().startsWith('usdc')) {
      return `${srcToken.symbol}USDC`;
    }
    if (srcToken.symbol.toLowerCase().startsWith('usdt')) {
      return `${dstToken.symbol}USDT`;
    }
    if (dstToken.symbol.toLowerCase().startsWith('usdt')) {
      return `${srcToken.symbol}USDT`;
    }
    if (dstToken.symbol.toLowerCase().includes('usd')) {
      return `${srcToken.symbol}USDT`;
    }
    if (srcToken.symbol.toLowerCase().includes('usd')) {
      return `${dstToken.symbol}USDT`;
    }
    return `${srcToken.symbol}USDT/${dstToken.symbol}USDT`;
  }

  private isChartSymbolNotFound(node: {
    childNodes: NodeListOf<ChildNode>;
    textContent: string;
  }): boolean {
    const childNodes = node.childNodes;
    if (node.textContent.trim() === 'Invalid symbol') return true;
    if (!childNodes.length) return false;

    let notFound: boolean = false;
    childNodes.forEach(child => {
      console.log('child ==>', { child, textContent: child.textContent });
      if (child.textContent.trim() === 'Invalid symbol') {
        return true;
      }

      notFound = this.isChartSymbolNotFound(child);
      if (notFound) return notFound;
    });

    return false;
  }

  // NOT FOUND addr - Ey59PH7Z4BFU4HjyKnyMdWt5GGN76KazTAwQihoUXRnk(PASTERNAK)
  // NOT FOUND addr - 6CAsXfiCXZfP8APCG6Vma2DFMindopxiqYQN4LSQfhoC(POKT-USDC) (TDCCP)
  private hasInvalidSymbol(node: Node): boolean {
    // Check current node's text content (trim whitespace for accurate matching)
    if (node.textContent?.trim() === 'Invalid symbol') {
      return true;
    }

    // If element node, check its child nodes recursively
    if (node.nodeType === Node.ELEMENT_NODE) {
      for (let i = 0; i < node.childNodes.length; i++) {
        if (this.hasInvalidSymbol(node.childNodes[i])) {
          return true; // Early exit if found in subtree
        }
      }
    }

    return false;
  }
}
