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
import { tap } from 'rxjs/operators';
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

  @Input() loading: boolean;

  @Output() onLogin = new EventEmitter<void>();

  @Output() onSwitchNetwork = new EventEmitter<void>();

  @Output() onApprove = new EventEmitter<PoolToken>();

  @Output() onCreateDeposit = new EventEmitter<void>();

  public readonly poolToken = PoolToken;

  private readonly _error$ = new BehaviorSubject<LpFormError | null>(null);

  public readonly error$ = this._error$.asObservable();

  public readonly errors = LpFormError;

  public readonly needUsdcApprove$ = this.lpService.needUsdcApprove$;

  public readonly needBrbcApprove$ = this.lpService.needBrbcApprove$;

  public readonly needSwitchNetwork$ = this.lpService.needSwitchNetwork$;

  public readonly needLogin$ = this.lpService.needLogin$;

  public readonly currentMaxLimit = this.lpService.currentMaxLimit;

  public readonly minLimit = this.lpService.minEnterAmount;

  constructor(private readonly lpService: LiquidityProvidingService) {}

  ngOnInit(): void {
    combineLatest([this.brbcAmount$, this.lpService.brbcBalance$])
      .pipe(
        tap(([brbcAmount, brbcBalance]) => {
          this._error$.next(this.lpService.checkDepositErrors(brbcAmount, brbcBalance));
        })
      )
      .subscribe();

    combineLatest([this.usdcAmount$, this.lpService.usdcBalance$])
      .pipe(
        tap(([usdcAmount, usdcBalance]) => {
          this._error$.next(this.lpService.checkDepositErrors(usdcAmount, usdcBalance));
        })
      )
      .subscribe();
  }
}
