import { FormControlType } from '@shared/models/utils/angular-forms-types';

export interface TimeForm {
  hours: number;
  minutes: number;
}

export type TimeFormControls = FormControlType<TimeForm>;
