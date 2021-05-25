import { TranslateService } from '@ngx-translate/core';
import { RubicError } from '../RubicError';

export class UserRejectError extends RubicError {
  constructor(protected readonly translateService: TranslateService) {
    super(translateService);
    this.comment = this.translateService.instant('errors.userReject');
  }
}
