import { TranslateService } from '@ngx-translate/core';
import { RubicError } from '../RubicError';

class SameTokensError extends RubicError {
  constructor(protected readonly translateService: TranslateService, message?: string) {
    super(translateService, message);
    this.comment = translateService.instant('errors.sameTokens');
  }
}

export default SameTokensError;
