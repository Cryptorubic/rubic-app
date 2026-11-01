import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import QRCode from 'qrcode';
import { oathConnectionLink } from './constants/oath-wallet';

export interface OathConnectionView {
  qrImage?: string;
  appLink?: string;
}

export class OathConnectionAttempt {
  public readonly controller = new AbortController();
  public readonly signal = this.controller.signal;
  private readonly expiry = setTimeout(() => this.cancel(), 300_000);

  public cancel(): void {
    this.controller.abort();
    this.dispose();
  }

  public dispose(): void {
    clearTimeout(this.expiry);
  }
}

@Injectable({ providedIn: 'root' })
export class OathConnectionService {
  private readonly viewSubject$ = new BehaviorSubject<OathConnectionView | null>(null);
  private currentRender: object | undefined;
  public readonly view$ = this.viewSubject$.asObservable();
  public attempt: OathConnectionAttempt | null = null;

  public begin(): OathConnectionAttempt {
    this.cancel();
    this.attempt = new OathConnectionAttempt();
    this.viewSubject$.next({});
    return this.attempt;
  }

  public async showUri(attempt: OathConnectionAttempt, uri: string): Promise<void> {
    if (this.attempt !== attempt || attempt.signal.aborted) return;
    const render = {};
    this.currentRender = render;
    const isCurrent = () =>
      this.currentRender === render && this.attempt === attempt && !attempt.signal.aborted;
    this.viewSubject$.next({});
    try {
      const appLink = oathConnectionLink(uri);
      const qrImage = await QRCode.toDataURL(uri, {
        width: 280,
        margin: 4,
        errorCorrectionLevel: 'M'
      });
      // A newer URI can supersede a render within the same connection attempt.
      if (isCurrent()) this.viewSubject$.next({ qrImage, appLink });
    } catch (error) {
      if (isCurrent()) throw error;
    }
  }

  public finish(attempt: OathConnectionAttempt): void {
    attempt.dispose();
    if (this.attempt === attempt) {
      this.attempt = null;
      this.viewSubject$.next(null);
    }
  }

  public cancel(): void {
    this.attempt?.cancel();
  }
}
