import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { mnemonicToAccount } from 'viem/accounts';

export function validateSecretPhrase(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    try {
      mnemonicToAccount(control.value);
      return null;
    } catch {
      return { wrongMnemonic: { value: control.value } };
    }
  };
}
