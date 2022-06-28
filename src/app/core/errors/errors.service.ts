import { Inject, Injectable, Injector } from '@angular/core';
import { TuiNotification } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TranslateService } from '@ngx-translate/core';
import { RubicError } from '@core/errors/models/rubic-error';
import { NotificationsService } from 'src/app/core/services/notifications/notifications.service';
import { UnknownErrorComponent } from 'src/app/core/errors/components/unknown-error/unknown-error.component';
import { UnknownError } from 'src/app/core/errors/models/unknown.error';
import { CUSTOM_RPC_ERROR } from '@core/errors/models/standard/custom-rpc-error';
import { EIP_1474 } from '@core/errors/models/standard/eip-1474';
import { EIP_1193 } from '@core/errors/models/standard/eip-1193';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicWarning } from '@core/errors/models/rubic-warning';
import {
  RubicSdkError,
  UserRejectError as SdkUserRejectError,
  TransactionRevertedError as SdkTransactionRevertedError,
  FailedToCheckForTransactionReceiptError as SdkFailedToCheckForTransactionReceiptError,
  LowGasError as SdkLowGasError,
  InsufficientFundsError as SdkInsufficientFundsError,
  LowSlippageDeflationaryTokenError as SdkLowSlippageDeflationaryTokenError
} from 'rubic-sdk';
import { UserRejectError } from './models/provider/user-reject-error';
import TransactionRevertedError from './models/common/transaction-reverted-error';
import FailedToCheckForTransactionReceiptError from '@core/errors/models/common/failed-to-check-for-transaction-receipt-error';
import { LowGasError } from './models/provider/low-gas-error';
import InsufficientFundsError from '@core/errors/models/instant-trade/insufficient-funds-error';
import { TokenWithFeeError } from '@core/errors/models/common/token-with-fee-error';

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
   * Catch error, show console message and notification if error is RubicError instance or show default unknown error message
   * @param error Caught error.
   */
  public catchAnyError(error: Error): void {
    if (error instanceof RubicError) {
      this.catch(error);
    } else {
      console.debug(error);
      this.catch(new UnknownError());
    }
  }

  /**
   * Catch error, show console message and notification if it needed.
   * @param err Caught error.
   */
  public catch(err: RubicError<ERROR_TYPE> | Error): void {
    console.debug(err);

    const error = ErrorsService.parseRubicSdkError(err);

    if (
      error.displayError === false ||
      error.message?.includes('Attempt to use a destroyed view')
    ) {
      return;
    }

    const isWarning = error instanceof RubicWarning;

    const options = {
      label: this.translateService.instant(isWarning ? 'common.warning' : 'common.error'),
      status: isWarning ? TuiNotification.Warning : TuiNotification.Error,
      data: {},
      autoClose: 7000
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
      currentError.message.includes(rpcError.code) ||
      currentError.message.toLocaleLowerCase().includes(rpcError.message.toLocaleLowerCase()) ||
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

  private static parseRubicSdkError(
    err: RubicError<ERROR_TYPE> | RubicSdkError
  ): RubicError<ERROR_TYPE> {
    if (err instanceof RubicSdkError) {
      if (err instanceof SdkTransactionRevertedError) {
        return new TransactionRevertedError();
      }
      if (err instanceof SdkFailedToCheckForTransactionReceiptError) {
        return new FailedToCheckForTransactionReceiptError();
      }
      if (err instanceof SdkUserRejectError) {
        return new UserRejectError();
      }
      if (err instanceof SdkInsufficientFundsError) {
        return new InsufficientFundsError(err.tokenSymbol, err.balance, err.requiredBalance);
      }
      if (err instanceof SdkLowGasError) {
        return new LowGasError();
      }
      if (err instanceof SdkLowSlippageDeflationaryTokenError) {
        return new TokenWithFeeError();
      }
      if (err?.message) {
        if (err.message.includes('Request failed with status code 400')) {
          return new RubicError(
            'Oneinch provider is unavailable. Try to choose another or wait a few minutes.'
          );
        }
        return new RubicError(err.message);
      }

      return new RubicError('[RUBIC SDK] Unknown error.');
    }

    return err;
  }
}
