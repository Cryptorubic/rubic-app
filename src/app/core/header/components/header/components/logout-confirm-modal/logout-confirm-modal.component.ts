import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialog } from '@taiga-ui/cdk';

@Component({
  selector: 'app-logout-confirm-modal',
  templateUrl: './logout-confirm-modal.component.html',
  styleUrls: ['./logout-confirm-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutConfirmModalComponent {
  public logoutProgress: boolean;

  constructor(
    private readonly authService: AuthService,
    @Inject(POLYMORPHEUS_CONTEXT) readonly context: TuiDialog<boolean, void>
  ) {}

  public close() {
    this.context.completeWith(null);
  }

  public confirmLogout(): void {
    this.authService.signOut().subscribe(
      () => {
        this.context.completeWith(null);
      },
      () => {
        this.logoutProgress = false;
      },
      () => {
        this.logoutProgress = false;
      }
    );
  }
}
