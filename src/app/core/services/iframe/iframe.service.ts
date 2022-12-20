import { Inject, Injectable, OnDestroy, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { WINDOW } from '@ng-web-apis/common';
import { IframeParameters } from '@core/services/iframe/models/iframe-parameters';
import { IframeAppearance } from '@core/services/iframe/models/iframe-appearance';

@Injectable({
  providedIn: 'root'
})
export class IframeService implements OnDestroy {
  private documentListener: () => void;

  private readonly _isIframe$ = new BehaviorSubject<boolean>(false);

  public readonly isIframe$ = this._isIframe$.asObservable();

  private iframeParameters: IframeParameters;

  private readonly _widgetIntoViewport$ = new Subject<boolean>();

  public readonly widgetIntoViewport$ = this._widgetIntoViewport$.asObservable();

  public get isIframe(): boolean {
    return this._isIframe$.getValue();
  }

  public get iframeAppearance(): IframeAppearance | undefined {
    return this.iframeParameters?.iframeAppearance;
  }

  public get device(): 'mobile' | 'desktop' | undefined {
    return this.iframeParameters?.device;
  }

  public get providerAddress(): string {
    return this.iframeParameters?.providerAddress;
  }

  public get tokenSearch(): boolean {
    return this.iframeParameters?.tokenSearch;
  }

  public get rubicLink(): boolean {
    return this.iframeParameters?.rubicLink;
  }

  public get originDomain(): string {
    const url =
      this.window.location !== this.window.parent.location
        ? document.referrer
        : document.location.href;
    return new URL(url).hostname;
  }

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly rendererFactory2: RendererFactory2,
    @Inject(WINDOW) private readonly window: Window
  ) {}

  ngOnDestroy() {
    this.documentListener?.();
  }

  public setIframeInfo(iframeParameters: IframeParameters): void {
    this.iframeParameters = iframeParameters;

    const { device } = iframeParameters;
    if (device !== 'desktop' && device !== 'mobile') {
      console.error(`Wrong device value: ${device}`);
    }

    this.setIframeStatus();
    this.setupViewportListener();
  }

  private setIframeStatus(): void {
    this._isIframe$.next(true);

    this.document
      .getElementsByTagName('html')[0]
      .classList.add('iframe', `iframe-${this.iframeParameters.iframeAppearance}`);
  }

  private setupViewportListener(): void {
    const renderer = this.rendererFactory2.createRenderer(null, null);
    this.documentListener = renderer.listen('window', 'message', ($event: MessageEvent) => {
      const isWidgetIntoViewportEvent = $event.data?.name === 'widget-into-viewport';
      const widgetIntoViewportDefined = $event.data?.widgetIntoViewport !== undefined;
      if (isWidgetIntoViewportEvent && widgetIntoViewportDefined) {
        this._widgetIntoViewport$.next($event.data?.widgetIntoViewport);
      }
    });
  }
}
