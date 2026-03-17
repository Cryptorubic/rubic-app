import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '@app/core/services/auth/auth.service';

@Component({
  selector: 'app-login-window',
  templateUrl: './login-window.component.html',
  styleUrls: ['./login-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginWindowComponent {
  @Input({ required: true }) authorized: boolean;

  @Input() showLoader: boolean = false;

  @Output() handleClick = new EventEmitter();

  public readonly currUser$ = this.authService.currentUser$;

  constructor(private readonly authService: AuthService) {}

  public onClick(): void {
    this.handleClick.emit();
  }
}
