import { Component, Inject, Injector, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { TuiAppearance, TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { WalletsModalComponent } from '../wallets-modal/wallets-modal.component';

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
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector
  ) {
    this.$currentUser = this.authService.getCurrentUser();
  }

  public showModal(): void {
    this.dialogService
      .open(new PolymorpheusComponent(WalletsModalComponent, this.injector), { size: 's' })
      .subscribe();
  }
}
