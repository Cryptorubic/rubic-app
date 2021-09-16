import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { WINDOW } from 'src/app/core/models/window';

@Injectable({
  providedIn: 'root'
})
export class IframeService {
  private readonly _isIframe$ = new BehaviorSubject<boolean>(false);

  private readonly _iframeAppearance$ = new BehaviorSubject<'vertical' | 'horizontal'>(undefined);

  private readonly _device$ = new BehaviorSubject<'mobile' | 'desktop'>(undefined);

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

  public get originDomain(): string {
    const url =
      this.window.location !== this.window.parent.location
        ? document.referrer
        : document.location.href;
    return new URL(url).hostname;
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(WINDOW) private readonly window: Window
  ) {}

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
}
