import { Inject, Injectable, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IframeParams } from '@core/services/iframe-service/models/iframe-params';
import { DOCUMENT } from '@angular/common';
import { WINDOW } from '@ng-web-apis/common';

@Injectable({
  providedIn: 'root'
})
export class IframeService {
  private readonly _isIframe$ = new BehaviorSubject<boolean | undefined>(undefined);

  public readonly isIframe$ = this._isIframe$.asObservable();

  private iframeParameters: IframeParams;

  public get isIframe(): boolean {
    return this._isIframe$.getValue();
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

  public setIframeFalse(): void {
    this._isIframe$.next(false);
  }

  public setIframeInfo(iframeParameters: IframeParams): void {
    this.iframeParameters = iframeParameters;

    const { device } = iframeParameters;
    if (device !== 'desktop' && device !== 'mobile') {
      console.error(`Wrong device value: ${device}`);
    }

    this.setIframeStatus();
  }

  private setIframeStatus(): void {
    this._isIframe$.next(true);
    this.document.getElementsByTagName('html')[0].classList.add('iframe');
  }
}
