import { TranslateService } from '@ngx-translate/core';
import { RubicError } from '../RubicError';

class InsufficientFundsError extends RubicError {
  constructor(
    tokenSymbol: string,
    balance: string,
    requiredBalance: string,
    translateService: TranslateService,
    message?: string
  ) {
    super(translateService, message);
    this.comment = this.translateService.instant('errors.insufficientFunds', {
      tokenSymbol,
      balance,
      requiredBalance
    });
  }
}

export default InsufficientFundsError;
