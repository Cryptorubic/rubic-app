import { Inject, Injectable, OnDestroy, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { WINDOW } from '@ng-web-apis/common';
import { IframeParameters } from '@core/services/iframe/models/iframe-parameters';
import { IframeAppearance } from '@core/services/iframe/models/iframe-appearance';
import { Cacheable } from 'ts-cacheable';
import { catchError } from 'rxjs/operators';
import { RubicError } from '@core/errors/models/rubic-error';
import { WHITELIST_PROVIDERS } from '@core/services/iframe/constants/whitelist-providers';
import { PromotionPromoterAddressApiService } from '@core/services/backend/promotion-api/promotion-promoter-address-api.service';
import { BlockchainName, OnChainTradeType } from 'rubic-sdk';

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

  public get feeData(): {
    fee: number;
    feeTarget: string;
  } {
    return {
      fee: this.iframeParameters.fee,
      feeTarget: this.iframeParameters.feeTarget
    };
  }

  public get promoCode(): string {
    return this.iframeParameters.promoCode;
  }

  public get tokenSearch(): boolean {
    return this.iframeParameters.tokenSearch;
  }

  public get rubicLink(): boolean {
    return this.iframeParameters.rubicLink;
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
    @Inject(WINDOW) private readonly window: Window,
    private readonly promotionPromoterAddressApiService: PromotionPromoterAddressApiService
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

    const { fee, feeTarget } = iframeParameters;
    if (Boolean(fee) !== Boolean(feeTarget)) {
      throw new RubicError(null, null, '`fee` or `feeTarget` parameter is missing.');
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

  @Cacheable()
  public getPromoterAddress(): Observable<string | null> {
    const { promoCode } = this.iframeParameters;
    if (!promoCode) {
      return of(null);
    }

    return this.promotionPromoterAddressApiService.getPromoterWalletAddress(promoCode).pipe(
      catchError((err: unknown) => {
        console.error('Cannot retrieve promoter address:', err);
        return of(null);
      })
    );
  }

  public isIframeWithFee(blockchain: BlockchainName, providerType: OnChainTradeType): boolean {
    if (!this.isIframe || !this.iframeParameters.fee) {
      return false;
    }

    if (!(blockchain in WHITELIST_PROVIDERS)) {
      return false;
    }

    return WHITELIST_PROVIDERS[blockchain as keyof typeof WHITELIST_PROVIDERS].some(
      whitelistProvider => providerType === whitelistProvider
    );
  }
}
