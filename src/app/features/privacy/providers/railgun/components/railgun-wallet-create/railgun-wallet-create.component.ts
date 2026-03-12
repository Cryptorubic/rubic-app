import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TuiDialogContext } from '@taiga-ui/core';
import { Mnemonic, randomBytes } from 'ethers';
import { TUI_VALIDATION_ERRORS } from '@taiga-ui/kit';

type ContextParams = TuiDialogContext<{ password: string; mnemonic: string }>;

@Component({
  selector: 'app-railgun-wallet-create',
  templateUrl: './railgun-wallet-create.component.html',
  styleUrls: ['./railgun-wallet-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        required: 'This field is required'
      }
    }
  ]
})
export class RailgunWalletCreateComponent {
  private readonly context: ContextParams = inject(POLYMORPHEUS_CONTEXT) as ContextParams;

  public readonly secretForm = new FormGroup({
    agreement: new FormControl(false, [Validators.requiredTrue]),
    mnemonic: new FormControl(Mnemonic.fromEntropy(randomBytes(16)).phrase.trim(), []),
    password: new FormControl('', [Validators.required])
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
