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
  private readonly _token$ = new BehaviorSubject<string | false | null>(null);

  public readonly token$ = this._token$.asObservable();

  private readonly widgets = new Map<string, string>();

  public get token(): string | false | null {
    return this._token$.value;
  }

  private readonly window: RubicWindow = inject(WINDOW);

  private readonly zone = inject(NgZone);

  private readonly injector = inject(Injector);

  private get turnstile(): Turnstile {
    return this.window.turnstile;
  }

  constructor(private readonly modalService: ModalService) {}

  public async createInvisibleWidget(containerId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      console.log();
      this.turnstile.ready(() => {
        const widgetId = this.turnstile.render(containerId, {
          sitekey: '0x4AAAAAACHJ5X5WghmT8crG',
          callback: (token: string) => {
            console.log(`Invisible Widget ${widgetId} completed:`, token);
            this.zone.run(() => {
              this._token$.next(token);
              resolve(token);
            });
          },
          'error-callback': (error: Error) => {
            console.error(error);
            reject(error);
          }
        });

        this.widgets.set(containerId, widgetId);
      });
    });
  }

  public async createWidget(containerId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.turnstile.ready(() => {
        const widgetId = this.turnstile.render(containerId, {
          sitekey: '0x4AAAAAACHJ5X5WghmT8crG',
          callback: (token: string) => {
            console.log(`Widget ${widgetId} completed:`, token);
            this.zone.run(() => {
              this._token$.next(token);
              resolve(token);
            });
          },
          'error-callback': (error: Error) => {
            console.error(error);
            this.stopProcess();
            reject(error);
          }
        });

        this.widgets.set(containerId, widgetId);
      });
    });
  }

  public stopProcess(): void {
    this._token$.next(false);
  }

  public removeWidget(containerId: string): void {
    const widgetId = this.widgets.get(containerId);
    if (widgetId) {
      this.turnstile.remove(widgetId);
      this.widgets.delete(containerId);
    }
  }

  public resetWidget(containerId: string): void {
    const widgetId = this.widgets.get(containerId);
    if (widgetId) {
      this.turnstile.reset(widgetId);
    }
  }
}
