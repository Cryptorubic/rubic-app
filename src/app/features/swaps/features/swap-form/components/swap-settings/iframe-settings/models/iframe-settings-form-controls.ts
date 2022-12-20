import { FormControlType } from '@shared/models/utils/angular-forms-types';

export interface IframeSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  disableMultihops: boolean;
  autoRefresh: boolean;
  showReceiverAddress: boolean;
}

export type IframeSettingsFormControls = FormControlType<IframeSettingsForm>;
