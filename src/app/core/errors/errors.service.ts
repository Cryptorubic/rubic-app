import { Inject, Injectable, Injector } from '@angular/core';
import { TuiNotification } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TranslateService } from '@ngx-translate/core';
import { UndefinedErrorComponent } from 'src/app/core/errors/components/undefined-error/undefined-error.component';
import { RubicError } from 'src/app/core/errors/models/RubicError';
import { NotificationsService } from 'src/app/core/notifications/notifications.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {
  constructor(
    private readonly notificationsService: NotificationsService,
    @Inject(Injector) private injector: Injector,
    private readonly translateService: TranslateService
  ) {}

  public throw$(error: RubicError): never {
    // tslint:disable-next-line:no-console
    console.debug(error);

    const options = {
      label: this.translateService.instant('common.error'),
      status: TuiNotification.Error,
      data: {},
      autoClose: 7000
    };

    if (error?.type === 'component') {
      const errorComponent = new PolymorpheusComponent(
        error.component || UndefinedErrorComponent,
        this.injector
      );
      options.data = error?.data;
      this.notificationsService.show(errorComponent, options);
      throw error;
    }

    const text = error?.translateKey
      ? this.translateService.instant(error.translateKey)
      : error.message;
    this.notificationsService.show(text, options);

    throw error;
  }

  public catch$(error: RubicError): void {
    console.debug(error);

    if (error.displayError === false || error.message.includes('Attempt to use a destroyed view')) {
      return;
    }

    const options = {
      label: this.translateService.instant('common.error'),
      status: TuiNotification.Error,
      data: {},
      autoClose: 7000
    };

    if (error?.type === 'component') {
      const errorComponent = new PolymorpheusComponent(
        error.component || UndefinedErrorComponent,
        this.injector
      );
      if (error?.data) {
        options.data = error.data;
      }
      this.notificationsService.show(errorComponent, options);
      return;
    }

    const text = error?.translateKey
      ? this.translateService.instant(error.translateKey)
      : error.message;
    this.notificationsService.show(text, options);
  }
}
