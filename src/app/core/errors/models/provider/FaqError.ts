import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { FaqErrorComponent } from '@core/errors/components/faq-error/faq-error.component';

export class FaqError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor() {
    super(FaqErrorComponent);
    Object.setPrototypeOf(this, FaqError.prototype);
  }
}
