import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { validateSecretPhrase } from '@features/privacy/providers/railgun/utils/secret-phrase-validator';
import { PublicAccount } from '@features/privacy/providers/railgun/models/public-account';

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

  public readonly secretForm = new FormGroup({
    phrase: new FormControl('', [Validators.required, validateSecretPhrase]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  public onSubmit(): void {
    this.formSubmit.emit(this.secretForm.value as PublicAccount);
  }
}
