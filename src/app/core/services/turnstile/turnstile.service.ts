import { inject, Injectable, Injector, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Turnstile } from '@core/services/turnstile/turnstile.models';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { ModalService } from '@core/modals/services/modal.service';

@Injectable({
  providedIn: 'root'
})
export class TurnstileService {
  private readonly _cfModalOpened$ = new BehaviorSubject<boolean>(false);

  public readonly cfModalOpened$ = this._cfModalOpened$.asObservable();

  private readonly _token$ = new BehaviorSubject<string | null>(null);

  public readonly token$ = this._token$.asObservable();

  public get token(): string | null {
    return this._token$.value;
  }

  private readonly window: RubicWindow = inject(WINDOW);

  private readonly zone = inject(NgZone);

  private get turnstile(): Turnstile {
    return this.window.turnstile;
  }

  constructor(private readonly modalService: ModalService, private readonly injector: Injector) {}

  /**
   * @returns whether token successfully updated or not
   */
  public async askForCloudflareToken(): Promise<boolean> {
    try {
      this._cfModalOpened$.next(true);

      const success = await this.createInvisibleWidget();
      if (success) {
        this._cfModalOpened$.next(false);
        return true;
      }

      /**
       * calls createWidget() after component for cloudflare checkbox rendered
       */
      return this.modalService
        .openTurnstileModal(this.injector)
        .then(() => true)
        .catch(() => false)
        .finally(() => this._cfModalOpened$.next(false));
    } catch (err) {
      console.debug('[TurnstileService_updateCloudflareToken] err:', err);
      return false;
    }
  }

  /**
   * @returns whether token successfully updated or not
   */
  public async createInvisibleWidget(): Promise<boolean> {
    const containerId = '#turnstile-container-invisible';
    return new Promise<boolean>(resolve => {
      this.turnstile.ready(() => {
        this.turnstile.render(containerId, {
          sitekey: '0x4AAAAAACHJ5X5WghmT8crG',
          appearance: 'interaction-only',
          // sitekey: '2x00000000000000000000AB',
          // sitekey: '1x00000000000000000000BB',
          callback: (token: string) => {
            this.zone.run(() => {
              this._token$.next(token);
              resolve(true);
            });
          },
          'error-callback': (error: Error) => {
            console.debug('[TurnstileService_createInvisibleWidget] error-callback: ', error);
            resolve(false);
          }
        });
      });
    });
  }

  /**
   * @returns whether token successfully updated or not
   */
  public async createWidget(): Promise<boolean> {
    const containerId = '#turnstile-widget';

    return new Promise<boolean>(resolve => {
      this.turnstile.ready(() => {
        this.turnstile.render(containerId, {
          sitekey: '0x4AAAAAACHJ5X5WghmT8crG',
          // sitekey: '3x00000000000000000000FF',
          appearance: 'interaction-only',
          theme: 'dark',
          size: 'normal',
          callback: (token: string) => {
            this.zone.run(() => {
              this._token$.next(token);
              resolve(true);
            });
          },
          'error-callback': (error: Error) => {
            console.debug('[TurnstileService_createWidget] error-callback: ', error);
            resolve(false);
          }
        });
      });
    });
  }
}
