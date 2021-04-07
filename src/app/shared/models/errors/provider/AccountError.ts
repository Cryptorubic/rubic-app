import { TranslateService } from '@ngx-translate/core';
import { RubicError } from '../RubicError';

export class AccountError extends RubicError {
  public comment: string;

  constructor(protected readonly translateService: TranslateService) {
    super(translateService);
    this.comment = this.translateService.instant('errors.noMetamaskAccess')
  }
}
