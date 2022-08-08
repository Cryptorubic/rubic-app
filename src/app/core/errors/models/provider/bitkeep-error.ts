import { BitKeepErrorComponent } from 'src/app/core/errors/components/bitkeep-error/bitkeep-error.component';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class BitKeepError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor() {
    super(BitKeepErrorComponent);
    Object.setPrototypeOf(this, BitKeepError.prototype);
  }
}
