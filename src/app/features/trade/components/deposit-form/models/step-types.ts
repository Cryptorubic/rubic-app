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

export type ActionBtnState =
  | {
      text: string;
      active: boolean;
      invisible: false;
      loading?: boolean;
    }
  | {
      invisible: true;
    };

export interface DepositStepParams {
  active: boolean;
  loading: boolean;
  opened: boolean;
  title: string;
}

export interface QrCodesType {
  receiverOnly: HTMLCanvasElement;
  receiverWithAmount: HTMLCanvasElement | null;
}

export const DEPOSIT_FLOW = {
  TX: 'TX',
  MANUAL: 'MANUAL'
} as const;

export type DepositFlow = (typeof DEPOSIT_FLOW)[keyof typeof DEPOSIT_FLOW];
