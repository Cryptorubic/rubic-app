import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { RubicError } from '../../../../../../shared/models/errors/RubicError';
import { MessageBoxComponent } from '../../../../../../shared/components/message-box/message-box.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.scss']
})
export class LoginButtonComponent {
  public $currentUser: Observable<UserInterface>;

  constructor(
    private readonly authService: AuthService,
    private dialog: MatDialog,
    private readonly translateService: TranslateService
  ) {
    this.$currentUser = this.authService.getCurrentUser();
  }

  public async authUser(): Promise<void> {
    try {
      await this.authService.signIn();
    } catch (error) {
      if (error.code === 4001) {
        return;
      }
      const e = error instanceof RubicError ? error : new RubicError(this.translateService);
      const data: any = { title: 'Warinig', descriptionText: e.comment };
      this.dialog.open(MessageBoxComponent, {
        width: '400px',
        data
      });
    }
  }
}
