import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PrivacyForm, PrivacyFormValue } from './models/privacy-form';

@Injectable()
export class PrivacyFormService {
  private readonly form = new FormGroup<PrivacyForm>({
    fromAmount: new FormControl(null),
    fromToken: new FormControl(null),
    toToken: new FormControl(null)
  });

  constructor() {}

  public updateFormValue(value: Partial<PrivacyFormValue>): void {
    this.form.patchValue(value);
  }
}
