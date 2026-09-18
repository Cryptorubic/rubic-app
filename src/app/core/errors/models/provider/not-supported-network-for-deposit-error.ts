import { RubicError } from '@core/errors/models/rubic-error';
import { BlockchainName } from '@cryptorubic/core';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class NotSupportedNetworkForDepositError extends RubicError<ERROR_TYPE.TEXT> {
  constructor(network: BlockchainName) {
    super('errors.notSupportedNetworkForDeposit', { network });
    Object.setPrototypeOf(this, NotSupportedNetworkForDepositError.prototype);
  }
}
