import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { FormControl, FormGroup } from '@angular/forms';

export interface ItSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  deadline: number; // in minutes
  disableMultihops: boolean;
  autoRefresh: boolean;
  showReceiverAddress: boolean;
}

export interface ItSettingsFormControls {
  autoSlippageTolerance: FormControl<boolean>;
  slippageTolerance: FormControl<number>;
  deadline: FormControl<number>;
  disableMultihops: FormControl<boolean>;
  autoRefresh: FormControl<boolean>;
  showReceiverAddress: FormControl<boolean>;
}

export interface CcrSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  showReceiverAddress: boolean;
}

export interface CcrSettingsFormControls {
  autoSlippageTolerance: FormControl<boolean>;
  slippageTolerance: FormControl<number>;
  showReceiverAddress: FormControl<boolean>;
}

export interface SettingsForm {
  [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: ItSettingsForm;
  [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: CcrSettingsForm;
}

export interface SettingsFormControls {
  [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: FormGroup<ItSettingsFormControls>;
  [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: FormGroup<CcrSettingsFormControls>;
}
