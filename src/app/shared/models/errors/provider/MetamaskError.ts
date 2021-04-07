import { TranslateService } from '@ngx-translate/core';
import { RubicError } from '../RubicError';

export class MetamaskError extends RubicError {
  constructor(protected readonly translateService: TranslateService) {
    super(translateService);
    Object.setPrototypeOf(this, MetamaskError.prototype); // to make `instanceof MetamaskError` work
    this.comment = this.translateService.instant('errors.noMetamaskInstalled')
  }
}
