import { Inject, Injectable, Injector } from '@angular/core';
import { TuiNotification } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TranslateService } from '@ngx-translate/core';
import { RubicError } from '@core/errors/models/rubic-error';
import { NotificationsService } from 'src/app/core/services/notifications/notifications.service';
import { UnknownErrorComponent } from 'src/app/core/errors/components/unknown-error/unknown-error.component';
import { CUSTOM_RPC_ERROR } from '@core/errors/models/standard/custom-rpc-error';
import { EIP_1474 } from '@core/errors/models/standard/eip-1474';
import { EIP_1193 } from '@core/errors/models/standard/eip-1193';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicWarning } from '@core/errors/models/rubic-warning';
import { RubicSdkErrorParser } from '@core/errors/models/rubic-sdk-error-parser';
import { RubicSdkError } from '@cryptorubic/web3';

interface Question {
  title: string;
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {
  public questions: Question[];

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
   * @param err Caught error.
   */
  public catch(err: RubicError<ERROR_TYPE> | RubicSdkError | Error): void {
    console.debug(err);

    const error = RubicSdkErrorParser.parseError(err);

    if (
      error.displayError === false ||
      error.message?.includes('Attempt to use a destroyed view')
    ) {
      return;
    }

    const isWarning =
      error instanceof RubicWarning || (error instanceof RubicError && error.isWarning);

    const options = {
      label: this.translateService.instant(isWarning ? 'common.warning' : 'common.error'),
      status: isWarning ? TuiNotification.Warning : TuiNotification.Error,
      data: {},
      autoClose: 7000,
      icon: '',
      defaultAutoCloseTime: 0
    };

    if (this.isCustomRPCError(error)) {
      const errorComponent = new PolymorpheusComponent(
        error.component || UnknownErrorComponent,
        this.injector
      );
      this.notificationsService.show(errorComponent, options);
      return;
    }

    if (
      error?.type === ERROR_TYPE.COMPONENT ||
      error?.type === ERROR_TYPE.RAW_MESSAGE ||
      this.isRPCError(error)
    ) {
      const errorComponent = new PolymorpheusComponent(
        error.component || UnknownErrorComponent,
        this.injector
      );
      options.data =
        error?.data && Object.keys(error.data).length !== 0
          ? error.data
          : {
              message: error?.message
            };
      this.notificationsService.show(errorComponent, options);
      return;
    }

    const text = error?.translateKey
      ? this.translateService.instant(error.translateKey, error?.data)
      : error.message;
    this.notificationsService.show(text, options);
  }

  /**
   * Checks for an error.
   * @param rpcError Verifiable error.
   * @param currentError Current error to check.
   * @return boolean Error content flag.
   */
  public findRPCError(
    rpcError: { code?: string; message: string; description?: string },
    currentError: RubicError<ERROR_TYPE>
  ): boolean {
    return (
      currentError?.message?.includes(rpcError.code) ||
      currentError?.message?.toLocaleLowerCase()?.includes(rpcError.message.toLocaleLowerCase()) ||
      (currentError?.code && String(currentError.code) === rpcError.code)
    );
  }

  /**
   * Checks if error connected to RPC.
   * @param currentError Error to check.
   * @return boolean Error content flag.
   */
  private isRPCError(currentError: RubicError<ERROR_TYPE>): boolean {
    return (
      EIP_1193.some(rpcError => this.findRPCError(rpcError, currentError)) ||
      EIP_1474.some(rpcError => this.findRPCError(rpcError, currentError))
    );
  }

  /**
   * Checks if error connected to RPC.
   * @param currentError Error to check.
   * @return boolean Error content flag.
   */
  private isCustomRPCError(currentError: RubicError<ERROR_TYPE>): boolean {
    return CUSTOM_RPC_ERROR.some(rpcError => this.findRPCError(rpcError, currentError));
  }
}
