import { Inject, Injectable, OnDestroy, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { WINDOW } from 'src/app/core/models/window';

@Injectable({
  providedIn: 'root'
})
export class IframeService implements OnDestroy {
  private documentListener: () => void;

  private readonly _isIframe$ = new BehaviorSubject<boolean>(false);

  private readonly _iframeAppearance$ = new BehaviorSubject<'vertical' | 'horizontal'>(undefined);

  private readonly _device$ = new BehaviorSubject<'mobile' | 'desktop'>(undefined);

  private readonly _widgetIntoViewport$ = new Subject<boolean>();

  public get isIframe$(): Observable<boolean> {
    return this._isIframe$.asObservable().pipe(filter(value => value !== undefined));
  }

  public get isIframe(): boolean {
    return this._isIframe$.getValue();
  }

  public get iframeAppearance$(): Observable<'vertical' | 'horizontal'> {
    return this._iframeAppearance$.asObservable();
  }

  public get iframeAppearance(): 'vertical' | 'horizontal' | undefined {
    return this._iframeAppearance$.getValue();
  }

  public get device$(): Observable<'mobile' | 'desktop'> {
    return this._device$.asObservable().pipe(filter(value => value !== undefined));
  }

  public get device(): 'mobile' | 'desktop' {
    return this._device$.getValue();
  }

  public get widgetIntoViewport$(): Observable<boolean> {
    return this._widgetIntoViewport$.asObservable();
  }

  public get originDomain(): string {
    const url =
      this.window.location !== this.window.parent.location
        ? document.referrer
        : document.location.href;
    return new URL(url).hostname;
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private rendererFactory2: RendererFactory2,
    @Inject(WINDOW) private readonly window: Window
  ) {
    this.setUpViewportListener();
  }

  ngOnDestroy() {
    this.documentListener?.();
  }

  public setIframeStatus(iframe: string): void {
    if (iframe === 'vertical' || iframe === 'horizontal') {
      this._isIframe$.next(true);
      this._iframeAppearance$.next(iframe);
      this.document.getElementsByTagName('html')[0].classList.add('iframe', `iframe-${iframe}`);
    }
  }

  public setIframeDevice(device: string): void {
    if (device !== 'desktop' && device !== 'mobile') {
      console.error(`Wrong device value: ${device}`);
      return;
    }

    this._device$.next(device);
  }

  private setUpViewportListener(): void {
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
