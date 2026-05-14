import { WA_NAVIGATOR } from '@ng-web-apis/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TuiDialogContext } from '@taiga-ui/core';
import { Mnemonic, randomBytes } from 'ethers';
import { TUI_VALIDATION_ERRORS } from '@taiga-ui/kit';
import { BehaviorSubject } from 'rxjs';
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
  public hintShown = false;

  private readonly cdr = inject(ChangeDetectorRef);

  private readonly navigator = inject(WA_NAVIGATOR);

  private readonly _showWords$ = new BehaviorSubject(false);

  public readonly showWords$ = this._showWords$.asObservable();

  private readonly context: ContextParams = inject(POLYMORPHEUS_CONTEXT) as ContextParams;

  public readonly secretPhrase = Mnemonic.fromEntropy(randomBytes(16)).phrase.trim().split(' ');

  public readonly secretForm = new FormGroup({
    agreement: new FormControl(false, [Validators.requiredTrue]),
    password: new FormControl('', [Validators.required])
  });

  public toggleVisibility(): void {
    this._showWords$.next(!this._showWords$.value);
  }

  public handleConfirm(): void {
    if (this.secretForm.invalid) {
      this.secretForm.markAllAsTouched();
      return;
    }
    const formValue = this.secretForm.getRawValue();
    this.context.completeWith({
      password: formValue.password,
      mnemonic: this.secretPhrase.join(' ')
    });
  }

  public copyToClipboard(): void {
    this.openHint();
    this.navigator.clipboard.writeText(this.secretPhrase.join(' '));
  }

  public openHint(): void {
    this.hintShown = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.hintShown = false;
      this.cdr.markForCheck();
    }, 1000);
  }
}
