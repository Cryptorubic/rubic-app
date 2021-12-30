import { RubicError } from '@core/errors/models/rubic-error';
import { UnsupportedTokenCCRComponent } from '@core/errors/components/unsupported-token-ccr/unsupported-token-ccr.component';
import { ERROR_TYPE } from '@core/errors/models/error-type';

class UnsupportedTokenCCR extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor() {
    const questionId = 'unsupportedTokenCCR';
    super(UnsupportedTokenCCRComponent, {
      questionId
    });
    Object.setPrototypeOf(this, UnsupportedTokenCCR.prototype);
  }
}

export default UnsupportedTokenCCR;
