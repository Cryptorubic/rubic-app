import { TranslateService } from '@ngx-translate/core';
import { RubicError } from '../RubicError';

export class OverQueryLimitError extends RubicError {
  constructor(protected readonly translateService: TranslateService) {
    super(translateService);
    this.comment = this.translateService.instant('errors.overQueryLimit');
  }
}
