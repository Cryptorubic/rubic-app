import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginButtonComponent {
  public $currentUser: Observable<UserInterface>;

  constructor(private readonly authService: AuthService) {
    this.$currentUser = this.authService.getCurrentUser();
  }

  public authUser(): void {
    this.authService.signIn();
  }
}
