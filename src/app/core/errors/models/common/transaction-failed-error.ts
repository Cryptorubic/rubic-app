import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { TransactionFailedErrorComponent } from '@core/errors/components/transaction-failed-error/transaction-failed-error.component';
import { BlockchainName } from '@cryptorubic/core';

export class TransactionFailedError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor(blockchainName: BlockchainName, txHash?: string) {
    super(TransactionFailedErrorComponent, {
      txHash,
      blockchainName
    });
    Object.setPrototypeOf(this, TransactionFailedError.prototype);
  }
}
