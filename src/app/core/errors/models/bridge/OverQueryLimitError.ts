import { OverQueryLimitErrorComponent } from 'src/app/core/errors/components/over-query-limit-error/over-query-limit-error.component';
import { RubicError } from 'src/app/core/errors/models/RubicError';

export class OverQueryLimitError extends RubicError {
  constructor() {
    super('component', null, null, OverQueryLimitErrorComponent);
    Object.setPrototypeOf(this, OverQueryLimitError.prototype);
  }
}
