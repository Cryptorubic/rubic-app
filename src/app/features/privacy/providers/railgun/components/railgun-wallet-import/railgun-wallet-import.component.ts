import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Mnemonic } from 'ethers';
import { TUI_VALIDATION_ERRORS } from '@taiga-ui/kit';

type ContextParams = TuiDialogContext<{ password: string; mnemonic: string }>;

export function mnemonicValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.trim();

    if (!value) return null;

    const words = value.split(/\s+/);
    const validLengths = [12, 15, 18, 21, 24];

    if (!validLengths.includes(words.length)) {
      return {
        mnemonic: 'Mnemonic phrase must be 12, 15, 18, 21 or 24 words'
      };
    }

    try {
      const isValid = Mnemonic.isValidMnemonic(value);
      return isValid ? null : { mnemonic: 'Invalid checksum or unknown words' };
    } catch (e) {
      return { mnemonic: 'Invalid mnemonic phrase format' };
    }
  };
}

@Component({
  selector: 'app-railgun-wallet-import',
  templateUrl: './railgun-wallet-import.component.html',
  styleUrls: ['./railgun-wallet-import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        required: 'This field is required',
        mnemonic: (context: string | boolean) =>
          typeof context === 'string'
            ? context
            : 'Invalid seed phrase. Please check the words and order.'
      }
    }
  ]
})
export class RailgunWalletImportComponent {
  private readonly context: ContextParams = inject(POLYMORPHEUS_CONTEXT) as ContextParams;

  public readonly secretForm = new FormGroup({
    password: new FormControl('', [Validators.required]),
    mnemonic: new FormControl('', [Validators.required, mnemonicValidator()])
  });

  public handleConfirm(): void {
    if (this.secretForm.invalid) {
      this.secretForm.markAllAsTouched();
      return;
    }
    const formValue = this.secretForm.getRawValue();
    this.context.completeWith({
      password: formValue.password,
      mnemonic: formValue.mnemonic
    });
  }
}
