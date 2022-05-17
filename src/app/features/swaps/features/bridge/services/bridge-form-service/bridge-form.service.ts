import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';

@Injectable()
export class BridgeFormService {
  public formData: FormControl;

  constructor() {
    this.formData = new FormControl();
  }
}
