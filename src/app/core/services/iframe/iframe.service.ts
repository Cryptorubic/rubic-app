import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class IframeService {
  private readonly _isIframe$ = new BehaviorSubject<boolean>(false);

  private readonly _iframeAppearance$ = new BehaviorSubject<'vertical' | 'horizontal'>(undefined);

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

  public get originDomain(): string {
    const url =
      window.location !== window.parent.location ? document.referrer : document.location.href;
    return new URL(url).hostname;
  }

  constructor(@Inject(DOCUMENT) private document: Document) {}

  public setIframeStatus(iframe: string): void {
    if (iframe === 'vertical' || iframe === 'horizontal') {
      this._isIframe$.next(true);
      this._iframeAppearance$.next(iframe);
      this.document.getElementsByTagName('html')[0].classList.add('iframe', `iframe-${iframe}`);
    }
  }
}
