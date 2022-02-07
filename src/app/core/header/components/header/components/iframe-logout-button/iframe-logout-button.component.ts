import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-iframe-logout-button',
  templateUrl: './iframe-logout-button.component.html',
  styleUrls: ['./iframe-logout-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IframeLogoutButtonComponent {
  constructor(private readonly authService: AuthService) {}

  public logout(): void {
    this.authService.serverlessSignOut();
  }
}
