import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { FormControlType, FormGroupType } from '@shared/models/utils/angular-forms-types';

export interface ItSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  deadline: number; // in minutes
  disableMultihops: boolean;
  autoRefresh: boolean;
  showReceiverAddress: boolean;
}

export type ItSettingsFormControls = FormControlType<ItSettingsForm>;

export interface CcrSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  showReceiverAddress: boolean;
}

export type CcrSettingsFormControls = FormControlType<CcrSettingsForm>;

export interface SettingsForm {
  [SWAP_PROVIDER_TYPE.INSTANT_TRADE]: ItSettingsForm;
  [SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING]: CcrSettingsForm;
}

export type SettingsFormControls = FormGroupType<SettingsForm>;
