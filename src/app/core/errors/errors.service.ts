import { Inject, Injectable, Injector } from '@angular/core';
import { TuiNotification } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TranslateService } from '@ngx-translate/core';
import { UndefinedErrorComponent } from 'src/app/core/errors/components/undefined-error/undefined-error.component';
import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { NotificationsService } from 'src/app/core/services/notifications/notifications.service';
import { RubicWarning } from 'src/app/core/errors/models/RubicWarning';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {
  constructor(
    private readonly notificationsService: NotificationsService,
    @Inject(Injector) private injector: Injector,
    private translateService: TranslateService
  ) {}

  /**
   * @deprecated
   * @param error
   */
  public throw(error: RubicError<ERROR_TYPE>): never {
    this.catch(error);

    throw error;
  }

  public catch(error: RubicError<ERROR_TYPE>): void {
    console.debug(error);

    if (error.displayError === false || error.message.includes('Attempt to use a destroyed view')) {
      return;
    }

    const isWarning = error instanceof RubicWarning;

    const options = {
      label: this.translateService.instant(!isWarning ? 'common.error' : 'common.warning'),
      status: !isWarning ? TuiNotification.Error : TuiNotification.Warning,
      data: {},
      autoClose: 7000
    };

    if (error?.type === ERROR_TYPE.COMPONENT) {
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
      ? this.translateService.instant(error.translateKey, error?.data)
      : error.message;
    this.notificationsService.show(text, options);
  }
}
