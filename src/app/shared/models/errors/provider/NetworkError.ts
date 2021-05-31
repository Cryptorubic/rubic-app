import { TranslateService } from '@ngx-translate/core';
import { RubicError } from '../RubicError';

export class NetworkError extends RubicError {
  constructor(
    private _networkToChoose: string,
    protected readonly translateService: TranslateService,
    message?: string
  ) {
    super(translateService, message);
    Object.setPrototypeOf(this, NetworkError.prototype); // to make `instanceof NetworkError` work
  }

  get networkToChoose() {
    return this._networkToChoose;
  }
}
