import { Inject, Injectable, NgZone } from '@angular/core';
import {
  TuiNotificationContentContext,
  TuiNotificationOptions,
  TuiNotificationsService
} from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { TuiNotificationOptionsWithData } from '@taiga-ui/core/modules/notifications/notification-options';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  constructor(
    private readonly translateService: TranslateService,
    @Inject(TuiNotificationsService)
    private readonly tuiNotificationsService: TuiNotificationsService,
    private readonly ngZone: NgZone
  ) {}

  public show<T = undefined>(
    content: PolymorpheusContent<TuiNotificationContentContext>,
    options: TuiNotificationOptions | TuiNotificationOptionsWithData<T>
  ): Subscription {
    return this.ngZone.run(() =>
      this.tuiNotificationsService.show(content, { ...options }).subscribe()
    );
  }
}
