import { TuiPortalContext } from '@taiga-ui/cdk/portals';
import { Inject, Injectable, NgZone } from '@angular/core';
import {
  TuiNotificationOptions,
  TuiNotificationService
} from '@taiga-ui/core/components/notification';
import { Observable, Subscription } from 'rxjs';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { TranslateService } from '@ngx-translate/core';
import { ErrorInterface } from '@cryptorubic/core';

type DialogOptions<I> = Partial<TuiNotificationOptions<I>>;

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly LONG_DELAY = 15000;

  private readonly SHORT_DELAY = 5000;

  constructor(
    // eslint-disable-next-line rxjs/finnish
    @Inject(TuiNotificationService)
    private readonly tuiNotificationsService: TuiNotificationService,
    private readonly ngZone: NgZone,
    private readonly translateService: TranslateService
  ) {}

  public showSuccess(msg: string): Subscription {
    return this.ngZone.run(() =>
      this.tuiNotificationsService
        .open(msg, {
          appearance: 'success',
          autoClose: 10_000,
          data: null
        })
        .subscribe()
    );
  }

  public showError(msg: string): Subscription {
    return this.ngZone.run(() =>
      this.tuiNotificationsService
        .open(msg, {
          appearance: 'error',
          autoClose: 10_000,
          data: null
        })
        .subscribe()
    );
  }

  public showWarning(msg: string): Subscription {
    return this.ngZone.run(() =>
      this.tuiNotificationsService
        .open(msg, {
          appearance: 'warning',
          autoClose: 10_000,
          data: null
        })
        .subscribe()
    );
  }

  public showInfo(msg: string): Subscription {
    return this.ngZone.run(() =>
      this.tuiNotificationsService
        .open(msg, {
          appearance: 'info',
          autoClose: 10_000,
          data: null
        })
        .subscribe()
    );
  }

  public showSwapWarning(error: ErrorInterface): Subscription {
    return this.ngZone.run(() =>
      this.tuiNotificationsService
        .open(error.reason, {
          appearance: 'info',
          autoClose: 10_000,
          data: null
        })
        .subscribe()
    );
  }

  public show<I = unknown, O = undefined>(
    content: PolymorpheusContent<I & TuiPortalContext<O>>,
    options: DialogOptions<I>
  ): Subscription {
    return this.ngZone.run(() =>
      this.tuiNotificationsService.open(content, { ...options }).subscribe()
    );
  }

  public showInvalidPrivacyCodeWarning(): Subscription {
    return this.show('Your referral code is invalid.', {
      appearance: 'warning',
      autoClose: 10_000,
      data: null
    });
  }

  public showWithoutSubscribe<I = unknown>(
    content: PolymorpheusContent<I & TuiPortalContext<void>>,
    options: DialogOptions<I>
  ): Observable<void> {
    return this.ngZone.run(() => this.tuiNotificationsService.open(content, { ...options }));
  }

  public showApproveInProgress<I = unknown>(
    options?: Partial<TuiNotificationOptions<I>>
  ): Subscription {
    return this.show(this.translateService.instant('notifications.approveInProgress'), {
      appearance: options?.appearance ?? 'info',
      autoClose: options?.autoClose ?? 0,
      data: null
    });
  }

  public showApproveSuccessful<I = unknown>(
    options?: Partial<TuiNotificationOptions<I>>
  ): Subscription {
    return this.show(this.translateService.instant('notifications.successApprove'), {
      appearance: options?.appearance ?? 'success',
      autoClose: options?.autoClose ?? this.LONG_DELAY,
      data: null
    });
  }

  public showOpenMobileWallet<I = unknown>(
    options?: Partial<TuiNotificationOptions<I>>
  ): Subscription {
    return this.show(this.translateService.instant('notifications.openMobileWallet'), {
      appearance: options?.appearance ?? 'info',
      autoClose: options?.autoClose ?? this.SHORT_DELAY,
      data: null
    });
  }

  public showSolanaGaslessInfo(): Subscription {
    return this.show(this.translateService.instant('notifications.solanaGaslessContent'), {
      label: this.translateService.instant('notifications.solanaGaslessTitle'),
      appearance: 'success',
      autoClose: 10_000,
      data: null
    });
  }
}
