import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { TuiAppearance } from '@taiga-ui/core';
import { WalletsModalService } from 'src/app/core/wallets/services/wallets-modal.service';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.scss']
})
export class LoginButtonComponent {
  public $currentUser: Observable<UserInterface>;

  @Input() appearance: TuiAppearance | string = 'primary';

  constructor(
    private readonly authService: AuthService,
    private readonly walletsModalService: WalletsModalService
  ) {
    this.$currentUser = this.authService.getCurrentUser();
  }

  public showModal(): void {
    this.walletsModalService.open$();
  }
}
