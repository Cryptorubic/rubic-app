import { Inject, Injectable, Injector } from '@angular/core';
import { TuiNotification } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TranslateService } from '@ngx-translate/core';
import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { NotificationsService } from 'src/app/core/services/notifications/notifications.service';
import { RubicWarning } from 'src/app/core/errors/models/RubicWarning';
import { EIP_1193 } from 'src/app/core/errors/models/standard/EIP-1193';
import { EIP_1474 } from 'src/app/core/errors/models/standard/EIP-1474';
import { UnknownErrorComponent } from 'src/app/core/errors/components/unknown-error/unknown-error.component';

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

  /**
   * Catch error, show console message and notification if it needed.
   * @param error Caught error.
   */
  public catch(error: RubicError<ERROR_TYPE>): void {
    console.debug(error);

    if (error.displayError === false || error.message.includes('Attempt to use a destroyed view')) {
      return;
    }

    const isWarning = error instanceof RubicWarning;

    const options = {
      label: this.translateService.instant(isWarning ? 'common.warning' : 'common.error'),
      status: isWarning ? TuiNotification.Warning : TuiNotification.Error,
      data: {},
      autoClose: 7000
    };

    if (
      error?.type === ERROR_TYPE.COMPONENT ||
      error?.type === ERROR_TYPE.RAW_MESSAGE ||
      this.isRPCError(error)
    ) {
      const errorComponent = new PolymorpheusComponent(
        error.component || UnknownErrorComponent,
        this.injector
      );
      options.data = error?.data || error;
      this.notificationsService.show(errorComponent, options);
      return;
    }

    const text = error?.translateKey
      ? this.translateService.instant(error.translateKey, error?.data)
      : error.message;
    this.notificationsService.show(text, options);
  }

  /**
   * Check if error connected to RPC.
   * @param currentError Error to check.
   */
  private isRPCError(currentError: RubicError<ERROR_TYPE>): boolean {
    const findRPCError = (rpcError: { code: string; message: string; description: string }) =>
      currentError.message.includes(rpcError.code) ||
      (currentError?.code && String(currentError.code) === rpcError.code);
    const providerRPCError = EIP_1193.some(findRPCError);
    if (providerRPCError) {
      return true;
    }
    return EIP_1474.some(findRPCError);
  }
}
