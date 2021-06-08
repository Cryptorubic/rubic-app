import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { WalletsModalComponent } from '../wallets-modal/wallets-modal.component';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.scss']
})
export class LoginButtonComponent {
  public $currentUser: Observable<UserInterface>;

  constructor(private readonly authService: AuthService, private dialog: MatDialog) {
    this.$currentUser = this.authService.getCurrentUser();
  }

  public showModal(): void {
    this.dialog.open(WalletsModalComponent, { width: '420px' });
  }
}
