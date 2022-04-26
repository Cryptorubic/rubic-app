import {
  ChangeDetectionStrategy,
  Component,
  Output,
  EventEmitter,
  Input,
  OnInit
} from '@angular/core';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DEPOSIT_RATIO } from '../../constants/DEPOSIT_RATIO';
import { LpFormError } from '../../models/lp-form-error.enum';
import { PoolToken } from '../../models/pool-token.enum';
import { LiquidityProvidingService } from '../../services/liquidity-providing.service';

@Component({
  selector: 'app-deposit-button',
  templateUrl: './deposit-button.component.html',
  styleUrls: ['./deposit-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositButtonComponent implements OnInit {
  @Input() usdcAmount$: Observable<BigNumber>;

  @Input() brbcAmount$: Observable<BigNumber>;

  @Input() loadingDepositBtn: boolean;

  @Input() loadingUsdcApproveBtn: boolean;

  @Input() loadingBrbcApproveBtn: boolean;

  @Output() readonly onLogin = new EventEmitter<void>();

  @Output() readonly onSwitchNetwork = new EventEmitter<void>();

  @Output() readonly onApprove = new EventEmitter<PoolToken>();

  @Output() readonly onCreateDeposit = new EventEmitter<void>();

  public readonly poolToken = PoolToken;

  private readonly _error$ = new BehaviorSubject<LpFormError | null>(null);

  public readonly error$ = this._error$.asObservable();

  public readonly errors = LpFormError;

  public readonly needUsdcApprove$ = this.lpService.needUsdcApprove$;

  public readonly needBrbcApprove$ = this.lpService.needBrbcApprove$;

  public readonly needSwitchNetwork$ = this.lpService.needSwitchNetwork$;

  public readonly needLogin$ = this.lpService.needLogin$;

  public currentMaxLimit = this.lpService.currentMaxLimit;

  public readonly minLimit = this.lpService.minEnterAmount;

  public readonly isLpEnded = this.lpService.isLpEneded;

  public readonly blockchain = this.lpService.blockchain;

  constructor(private readonly lpService: LiquidityProvidingService) {}

  ngOnInit(): void {
    this.checkAmountAndBalance();
  }

  public checkAmountAndBalance(): void {
    combineLatest([this.brbcAmount$, this.lpService.usdcBalance$, this.lpService.brbcBalance$])
      .pipe(
        map(([brbcAmount, usdcBalance, brbcBalance]) => {
          return this.lpService.checkDepositErrors(
            brbcAmount,
            brbcAmount.multipliedBy(DEPOSIT_RATIO),
            usdcBalance,
            brbcBalance
          );
        })
      )
      .subscribe(error => {
        this.currentMaxLimit = this.lpService.currentMaxLimit;
        this._error$.next(error);
      });
  }
}
