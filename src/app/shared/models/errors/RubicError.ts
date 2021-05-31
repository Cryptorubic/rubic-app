import { TranslateService } from '@ngx-translate/core';

export class RubicError extends Error {
  public comment: string;

  constructor(protected readonly translateService: TranslateService, message?: string) {
    super(message);
    this.comment = this.translateService.instant('errors.undefined');
    Object.setPrototypeOf(this, RubicError.prototype);
  }
}
