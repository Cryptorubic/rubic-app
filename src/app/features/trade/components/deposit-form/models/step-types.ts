import { FormControl } from '@angular/forms';
import { TokenAmount } from '@cryptorubic/core';

export interface DepositFormDetails {
  srcToken: TokenAmount;
  dstToken: TokenAmount;
}

export interface InputAddressesStepForm {
  receiverAddr: FormControl<string>;
  refundAddr: FormControl<string>;
}

export interface ActionBtnState {
  text: string;
  active: boolean;
}

export interface DepositStepParams {
  active: boolean;
  loading: boolean;
  opened: boolean;
}

export interface QrCodesType {
  receiverOnly: HTMLCanvasElement;
  receiverWithAmount: HTMLCanvasElement | null;
}
