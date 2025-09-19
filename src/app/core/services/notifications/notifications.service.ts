import { Inject, Injectable, NgZone } from '@angular/core';
import { TuiAlertOptions, TuiAlertService } from '@taiga-ui/core';
import { Observable, Subscription } from 'rxjs';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { TranslateService } from '@ngx-translate/core';
import { TuiBaseDialogContext } from '@taiga-ui/cdk/interfaces';
import { ErrorInterface } from '@cryptorubic/core';

type DialogOptions<I> = Omit<TuiAlertOptions<I>, 'label' | 'hasCloseButton' | 'hasIcon'> &
  Partial<TuiAlertOptions<I>>;

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly LONG_DELAY = 15000;

  private readonly SHORT_DELAY = 5000;

  constructor(
    // eslint-disable-next-line rxjs/finnish
    @Inject(TuiAlertService) private readonly tuiNotificationsService: TuiAlertService,
    private readonly ngZone: NgZone,
    private readonly translateService: TranslateService
  ) {}

  public showSwapWarning(error: ErrorInterface): Subscription {
    return this.ngZone.run(() =>
      this.tuiNotificationsService
        .open(error.reason, {
          status: 'info',
          autoClose: 10_000,
          data: null,
          icon: '',
          defaultAutoCloseTime: 0
        })
        .subscribe()
    );
  }

  public show<I = unknown, O = undefined>(
    content: PolymorpheusContent<I & TuiBaseDialogContext<O>>,
    options: DialogOptions<I>
  ): Subscription {
    return this.ngZone.run(() =>
      this.tuiNotificationsService.open(content, { ...options }).subscribe()
    );
  }

  public showWithoutSubscribe<I = unknown, O = undefined>(
    content: PolymorpheusContent<I & TuiBaseDialogContext<O>>,
    options: DialogOptions<I>
  ): Observable<O> {
    return this.ngZone.run(() => this.tuiNotificationsService.open(content, { ...options }));
  }

  public showApproveInProgress<I = unknown>(options?: TuiAlertOptions<I>): Subscription {
    return this.show(this.translateService.instant('notifications.approveInProgress'), {
      status: options?.status ?? 'info',
      autoClose: options?.autoClose ?? false,
      data: null,
      icon: '',
      defaultAutoCloseTime: 0
    });
  }

  public showApproveSuccessful<I = unknown>(options?: TuiAlertOptions<I>): Subscription {
    return this.show(this.translateService.instant('notifications.successApprove'), {
      status: options?.status ?? 'success',
      autoClose: options?.autoClose ?? this.LONG_DELAY,
      data: null,
      icon: '',
      defaultAutoCloseTime: 0
    });
  }

  public showOpenMobileWallet<I = unknown>(options?: TuiAlertOptions<I>): Subscription {
    return this.show(this.translateService.instant('notifications.openMobileWallet'), {
      status: options?.status ?? 'info',
      autoClose: options?.autoClose ?? this.SHORT_DELAY,
      data: null,
      icon: '',
      defaultAutoCloseTime: 0
    });
  }

  public showSolanaGaslessInfo(): Subscription {
    return this.show(this.translateService.instant('notifications.solanaGaslessContent'), {
      label: this.translateService.instant('notifications.solanaGaslessTitle'),
      status: 'success',
      autoClose: 10_000,
      data: null,
      icon: '',
      defaultAutoCloseTime: 0
    });
  }
}
