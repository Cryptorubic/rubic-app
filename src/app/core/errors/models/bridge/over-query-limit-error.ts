import { OverQueryLimitErrorComponent } from 'src/app/core/errors/components/over-query-limit-error/over-query-limit-error.component';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class OverQueryLimitError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor() {
    super(OverQueryLimitErrorComponent);
    Object.setPrototypeOf(this, OverQueryLimitError.prototype);
  }
}
