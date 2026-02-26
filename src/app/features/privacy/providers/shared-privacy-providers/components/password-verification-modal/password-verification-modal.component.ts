import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

@Component({
  selector: 'app-password-verification-modal',
  templateUrl: './password-verification-modal.component.html',
  styleUrls: ['./password-verification-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('moveLabel', [
      state('true', style({ color: '#02b774', fontSize: '12px', top: '-5px' })),
      state('false', style({ color: '#9a9ab0', fontSize: '16px', top: '0px' })),
      transition(`true <=> false`, animate('0.2s ease-out'))
    ])
  ]
})
export class PasswordVerificationModalComponent {
  public readonly passwordControl = new FormControl<string>('', {
    validators: [Validators.required]
  });

  public readonly isPasswordValid$ = this.passwordControl.statusChanges.pipe(
    startWith(this.passwordControl.status),
    debounceTime(200),
    map(status => status === 'VALID'),
    distinctUntilChanged()
  );

  public isActiveInput: boolean;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      boolean,
      {
        verify: (password: string) => Promise<boolean>;
      }
    >
  ) {
    this.isActiveInput = !!this.passwordControl.value;
  }

  public onFocusChange(isFocused: boolean): void {
    this.isActiveInput = isFocused || !!this.passwordControl.value;
  }

  public async confirm(): Promise<void> {
    this.passwordControl.disable();
    const password = this.passwordControl.value;

    try {
      const isValid = await this.context.data.verify(password);
      this.context.completeWith(isValid);
    } catch {
      this.context.completeWith(false);
    }
  }

  public cancel(): void {
    this.context.completeWith(false);
  }
}
