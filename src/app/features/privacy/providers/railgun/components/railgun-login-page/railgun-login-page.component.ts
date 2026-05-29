import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Injector,
  Input,
  Output
} from '@angular/core';
import { PublicAccount } from '@features/privacy/providers/railgun/models/public-account';
import { StoreService } from '@core/services/store/store.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged, firstValueFrom } from 'rxjs';
import { TUI_VALIDATION_ERRORS } from '@taiga-ui/kit';
import { RailgunFacadeService } from '@features/privacy/providers/railgun/services/railgun-facade.service';
import { ModalService } from '@core/modals/services/modal.service';
import { RailgunWalletImportComponent } from '@features/privacy/providers/railgun/components/railgun-wallet-import/railgun-wallet-import.component';
import { RailgunWalletCreateComponent } from '@features/privacy/providers/railgun/components/railgun-wallet-create/railgun-wallet-create.component';

@Component({
  selector: 'app-railgun-login-page',
  templateUrl: './railgun-login-page.component.html',
  styleUrls: ['./railgun-login-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        required: 'You should enter the password',
        invalid: 'Incorrect password. Please try again.'
      }
    }
  ]
})
export class RailgunLoginPageComponent {
  @Input({ required: true }) public readonly railgunId: string;

  @Input({ required: true }) public readonly railgunAddress: string;

  @Input({ required: true }) public readonly loading: boolean;

  // @Input() set exitAccount(value: unknown) {
  //   this.hasAccount = false;
  // }

  @Output() public readonly formSubmit = new EventEmitter<PublicAccount>();

  private readonly storeService = inject(StoreService);

  private readonly storeKey = 'RAILGUN_ENCRYPTION_CREDS_V1';

  protected hasAccount = false;

  public readonly secretForm = new FormGroup({
    password: new FormControl('', [Validators.required])
  });

  private readonly railgunFacade = inject(RailgunFacadeService);

  private readonly cdr = inject(ChangeDetectorRef);

  private readonly injector = inject(Injector);

  private readonly modalService = inject(ModalService);

  constructor() {
    const storedCreds = this.storeService.getItem(this.storeKey);
    this.hasAccount = !!storedCreds;
    this.secretForm.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      this.secretForm.markAsTouched();
    });
  }

  public handleReset(): void {
    this.storeService.deleteItem(this.storeKey);
    this.hasAccount = false;
  }

  public async onSubmit(): Promise<void> {
    if (this.secretForm.invalid) {
      this.secretForm.markAllAsTouched();
      return;
    }

    const { password } = this.secretForm.getRawValue();

    try {
      this.secretForm.disable();
      await this.railgunFacade.unlockFromPassword(password);
      this.formSubmit.emit({ password, phrase: '' });
    } catch (error) {
      this.secretForm.enable();

      const passwordControl = this.secretForm.get('password');
      if (passwordControl) {
        passwordControl.setErrors({ invalid: true });
        passwordControl.markAsTouched();
      }
      this.cdr.markForCheck();
    } finally {
      if (this.secretForm.disabled) {
        this.secretForm.enable();
        this.cdr.markForCheck();
      }
    }
  }

  protected async handleImport(): Promise<void> {
    const modal$ = this.modalService.showDialog<unknown, { password: string; mnemonic: string }>(
      RailgunWalletImportComponent,
      {
        size: 's',
        showMobileMenu: true,
        fitContent: true,
        title: 'Import Wallet'
      },
      this.injector
    );
    const modalInfo = await firstValueFrom(modal$);
    if (modalInfo) {
      const { password, mnemonic } = modalInfo;
      this.formSubmit.emit({ password, phrase: mnemonic });
    }
  }

  protected async handleCreate(): Promise<void> {
    const modal$ = this.modalService.showDialog<unknown, { password: string; mnemonic: string }>(
      RailgunWalletCreateComponent,
      {
        size: 's',
        showMobileMenu: true,
        fitContent: true,
        title: 'Create Wallet'
      },
      this.injector
    );
    const modalInfo = await firstValueFrom(modal$);
    if (modalInfo) {
      const { password, mnemonic } = modalInfo;
      this.formSubmit.emit({ password, phrase: mnemonic });
    }
  }
}
