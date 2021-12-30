import { ExcludeFunctions } from '@shared/models/utility-types/exclude-functions';

export type NgChanges<Component, Props = ExcludeFunctions<Component>> = {
  [Key in keyof Props]: {
    previousValue: Props[Key];
    currentValue: Props[Key];
    firstChange: boolean;
    isFirstChange(): boolean;
  };
};
