import { FormControl } from '@angular/forms';

export interface IframeSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  disableMultihops: boolean;
  autoRefresh: boolean;
  showReceiverAddress: boolean;
}

export interface IframeSettingsFormControls {
  autoSlippageTolerance: FormControl<boolean>;
  slippageTolerance: FormControl<number>;
  disableMultihops: FormControl<boolean>;
  autoRefresh: FormControl<boolean>;
  showReceiverAddress: FormControl<boolean>;
}
