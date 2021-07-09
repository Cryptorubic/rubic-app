import { ErrorType } from 'src/app/core/errors/models/error-type';
import { Type } from '@angular/core';

export abstract class RubicError extends Error {
  public translateKey: string;

  public type: ErrorType;

  public component: Type<object>;

  public data: object;

  public displayError: boolean;

  protected constructor(
    errorType: ErrorType,
    translateKey?: string,
    message?: string,
    component?: Type<object>,
    data?: object
  ) {
    super(message);
    this.translateKey = translateKey;
    this.type = errorType;
    this.component = component;
    this.data = data;
    this.displayError = true;
  }
}
