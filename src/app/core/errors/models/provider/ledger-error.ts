import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { LedgerErrorComponent } from '../../components/ledger-error/ledger-error.component';

export class LedgerError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor() {
    super(LedgerErrorComponent);
    Object.setPrototypeOf(this, LedgerError.prototype);
  }
}
