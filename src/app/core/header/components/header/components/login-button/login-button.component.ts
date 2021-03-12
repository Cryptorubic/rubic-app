import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginButtonComponent {
  constructor(private readonly authService: AuthService) {}

  public authUser(): void {
    this.authService.metamaskAuth();
  }
}
