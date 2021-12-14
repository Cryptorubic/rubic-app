import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { RubicError } from '@core/errors/models/RubicError';
import { UnsupportedTokenCCRComponent } from '@core/errors/components/unsupported-token-CCR/unsupported-token-ccr.component';

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
