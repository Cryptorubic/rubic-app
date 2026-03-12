import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { validateSecretPhrase } from '@features/privacy/providers/railgun/utils/secret-phrase-validator';
import { PublicAccount } from '@features/privacy/providers/railgun/models/public-account';
import { StoreService } from '@core/services/store/store.service';

@Component({
  selector: 'app-railgun-form',
  templateUrl: './railgun-form.component.html',
  styleUrls: ['./railgun-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RailgunFormComponent {
  @Input({ required: true }) public readonly railgunId: string;

  @Input({ required: true }) public readonly railgunAddress: string;

  @Output() public readonly formSubmit = new EventEmitter<PublicAccount>();

  private readonly storeService = inject(StoreService);

  private readonly storeKey = 'RAILGUN_ENCRYPTION_CREDS_V1';

  protected hasAccount = false;

  protected readonly cdr = inject(ChangeDetectorRef);

  public readonly secretForm = new FormGroup({
    phrase: new FormControl('', [
      ...(this.hasAccount ? [] : [Validators.required]),
      validateSecretPhrase
    ]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  constructor() {
    const storedCreds = this.storeService.getItem(this.storeKey);
    this.hasAccount = !!storedCreds;
    // this.cdr.detectChanges();
  }

  public onSubmit(): void {
    this.formSubmit.emit(this.secretForm.value as PublicAccount);
  }
}
