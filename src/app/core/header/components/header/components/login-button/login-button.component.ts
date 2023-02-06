import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TuiAppearance } from '@taiga-ui/core';
import { WalletsModalService } from 'src/app/core/wallets-modal/services/wallets-modal.service';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginButtonComponent {
  public currentUser$ = this.authService.currentUser$;

  @Input() appearance: TuiAppearance | string = 'primary';

  constructor(
    private readonly authService: AuthService,
    private readonly walletsModalService: WalletsModalService
  ) {}

  public showModal(): void {
    this.walletsModalService.open$();
  }
}
