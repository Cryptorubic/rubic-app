import { Injectable } from '@angular/core';
import { BridgeModule } from '@features/swaps/features/bridge/bridge.module';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: BridgeModule
})
export class BridgeFormService {
  public formData: FormControl;

  constructor() {
    this.formData = new FormControl();
  }
}
