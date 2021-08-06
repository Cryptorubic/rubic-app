import { Inject, Injectable, NgZone } from '@angular/core';
import { TuiNotificationsService } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  constructor(
    private readonly translateService: TranslateService,
    @Inject(TuiNotificationsService) private readonly notificationsService: TuiNotificationsService,
    private readonly ngZone: NgZone
  ) {}

  public show(content, options): Subscription {
    return this.ngZone.run(() =>
      this.notificationsService.show(content, { ...options }).subscribe()
    );
  }
}
