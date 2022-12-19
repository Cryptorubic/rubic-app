import { FormControl, FormGroup } from '@angular/forms';

export type FormControlType<T> = {
  [P in keyof T]: FormControl<T[P]>;
};

export type FormGroupType<T> = {
  [P in keyof T]: FormGroup<FormControlType<T[P]>>;
};
