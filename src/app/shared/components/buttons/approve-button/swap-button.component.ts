import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  INJECTOR,
  Injector,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WalletsModalComponent } from 'src/app/core/header/components/header/components/wallets-modal/wallets-modal.component';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import BigNumber from 'bignumber.js';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { TRADE_STATUS } from '../../../models/swaps/TRADE_STATUS';

enum ERROR_TYPE {
  INSUFFINEIENT_FUNDS = 'Insufficient balance'
}

@Component({
  selector: 'app-swap-button',
  templateUrl: './swap-button.component.html',
  styleUrls: ['./swap-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapButtonComponent implements OnInit {
  @Input() needApprove: boolean;

  @Input() status: TRADE_STATUS;

  @Input() formService: FormService;

  @Input() set fromAmount(value: BigNumber) {
    this._fromAmount = value;
    this.checkInsufficientFundsError();
  }

  @Output() approveClick = new EventEmitter<void>();

  @Output() swapClick = new EventEmitter<void>();

  @Output() loginEvent = new EventEmitter<void>();

  public TRADE_STATUS = TRADE_STATUS;

  public needLogin: Observable<boolean>;

  public loading: boolean;

  public hasError: boolean;

  public errorType: ERROR_TYPE;

  private fromToken: TokenAmount;

  private _fromAmount: BigNumber;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly dialogService: TuiDialogService,
    @Inject(INJECTOR) private readonly injector: Injector
  ) {}

  ngOnInit(): void {
    this.needApprove = false;
    this.needLogin = this.authService.getCurrentUser().pipe(map(user => !user?.address));

    this.loading = true;
    this.hasError = false;
    this.fromToken = this.formService.commonTrade.controls.input.value.fromToken;
    this.checkInsufficientFundsError();
    this.formService.commonTrade.controls.input.valueChanges.subscribe(form => {
      this.fromToken = form.fromToken;
      this.checkInsufficientFundsError();
    });
  }

  private checkInsufficientFundsError(): void {
    if (!this._fromAmount || !this.fromToken) {
      this.loading = false;
      return;
    }

    if (this.fromToken.amount.isNaN()) {
      this.loading = true;
      return;
    }

    this.hasError = this.fromToken.amount.lt(this._fromAmount);
    this.errorType = ERROR_TYPE.INSUFFINEIENT_FUNDS;

    this.loading = false;
    this.cdr.detectChanges();
  }

  public onLogin() {
    this.dialogService
      .open(new PolymorpheusComponent(WalletsModalComponent, this.injector), { size: 's' })
      .subscribe(() => this.loginEvent.emit());
  }
}
