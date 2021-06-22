import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  INJECTOR,
  Injector
} from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WalletsModalComponent } from 'src/app/core/header/components/header/components/wallets-modal/wallets-modal.component';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TRADE_STATUS } from '../../../models/swaps/TRADE_STATUS';

@Component({
  selector: 'app-swap-button',
  templateUrl: './swap-button.component.html',
  styleUrls: ['./swap-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapButtonComponent {
  @Input() needApprove: boolean = false;

  @Input() status: TRADE_STATUS;

  @Output() approveClick = new EventEmitter<void>();

  @Output() swapClick = new EventEmitter<void>();

  public TRADE_STATUS = TRADE_STATUS;

  public needLogin: Observable<boolean>;

  constructor(
    authService: AuthService,
    private dialogService: TuiDialogService,
    @Inject(INJECTOR) private injector: Injector
  ) {
    this.needLogin = authService.getCurrentUser().pipe(map(user => !user?.address));
  }

  onLogin() {
    this.dialogService
      .open(new PolymorpheusComponent(WalletsModalComponent, this.injector), { size: 's' })
      .subscribe();
  }
}
