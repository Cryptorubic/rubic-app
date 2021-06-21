import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  INJECTOR,
  Injector,
  OnInit
} from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TRADE_STATUS } from '../../../models/swaps/TRADE_STATUS';
import { WalletsModalComponent } from '../../../../core/header/components/header/components/wallets-modal/wallets-modal.component';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-approve-button',
  templateUrl: './approve-button.component.html',
  styleUrls: ['./approve-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApproveButtonComponent implements OnInit {
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

  ngOnInit() {
    console.log(this.status);
  }
}
