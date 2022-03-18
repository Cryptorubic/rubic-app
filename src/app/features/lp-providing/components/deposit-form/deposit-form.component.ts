import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  filter,
  finalize,
  map,
  startWith,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { LpProvidingService } from '../../services/lp-providing.service';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { LiquidityPeriod } from '../../models/lp-period.enum';
import { Router } from '@angular/router';
import { LpProvidingNotificationsService } from '../../services/lp-providing-notifications.service';
import { LpProvidingModalsService } from '../../services/lp-providing-modals.service';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from '@app/core/services/auth/auth.service';

enum LiquidityPeriodInMonth {
  SHORT = '1m',
  AVERAGE = '3m',
  LONG = '6m'
}

const LIQUIDITY_PERIOD_BY_MONTH = {
  [LiquidityPeriodInMonth.SHORT]: LiquidityPeriod.SHORT,
  [LiquidityPeriodInMonth.AVERAGE]: LiquidityPeriod.AVERAGE,
  [LiquidityPeriodInMonth.LONG]: LiquidityPeriod.LONG
};

@Component({
  selector: 'app-deposit-form',
  templateUrl: './deposit-form.component.html',
  styleUrls: ['./deposit-form.component.scss'],
  providers: [TuiDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositFormComponent implements OnInit {
  public readonly brbcAmountCtrl = new FormControl(this.service.minEnterAmount.toFixed(2));

  public readonly usdcAmountCtrl = new FormControl(this.service.minEnterAmount.toFixed(2));

  public readonly liquidityPeriodCtrl = new FormControl(30);

  public readonly liquidityPeriodHotkeys = Object.values(LiquidityPeriodInMonth);

  public readonly liquidityPeriodInMonth = LIQUIDITY_PERIOD_BY_MONTH;

  private readonly _rbcAmountUsdPrice$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly rbcAmountUsdPrice$ = this._rbcAmountUsdPrice$.asObservable();

  private readonly _usdcAmountUsdPrice$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly usdcAmountUsdPrice$ = this._usdcAmountUsdPrice$.asObservable();

  public readonly usdcBalance$ = this.service.usdcBalance$;

  public readonly brbcBalance$ = this.service.brbcBalance$;

  private readonly _buttonLoading$ = new BehaviorSubject<boolean>(false);

  public readonly buttonLoading$ = this._buttonLoading$.asObservable();

  public readonly brbcAmount$ = this.brbcAmountCtrl.valueChanges.pipe(
    startWith(this.brbcAmountCtrl.value),
    map(value => this.service.parseInputValue(value)),
    tap(async () => {
      // const amountUsdPrice = await this.service.calculateUsdPrice(new BigNumber(amount), 'brbc');
      this._rbcAmountUsdPrice$.next(new BigNumber(1231.323));
    }),
    takeUntil(this.destroy$)
  );

  public readonly usdcAmount$ = this.usdcAmountCtrl.valueChanges.pipe(
    startWith(this.usdcAmountCtrl.value),
    map(value => this.service.parseInputValue(value)),
    tap(async () => {
      // const amountUsdPrice = await this.service.calculateUsdPrice(new BigNumber(amount), 'usdc');
      this._usdcAmountUsdPrice$.next(new BigNumber(1231.323));
    }),
    takeUntil(this.destroy$)
  );

  public readonly liquidityPeriod$ = this.liquidityPeriodCtrl.valueChanges.pipe(
    startWith(this.liquidityPeriodCtrl.value),
    takeUntil(this.destroy$)
  );

  constructor(
    private readonly service: LpProvidingService,
    private readonly notificationService: LpProvidingNotificationsService,
    private readonly router: Router,
    private readonly lpProvidingModalService: LpProvidingModalsService,
    private readonly destroy$: TuiDestroyService,
    private readonly cdr: ChangeDetectorRef,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.service.userAddress$
      .pipe(
        filter(user => Boolean(user?.address)),
        switchMap(() => {
          return forkJoin([
            this.service.getAndUpdatePoolTokensBalances(),
            this.service.getNeedTokensApprove()
          ]);
        })
      )
      .subscribe();

    this.liquidityPeriod$
      .pipe(withLatestFrom(this.usdcAmount$))
      .subscribe(([liquidityPeriod, usdcAmount]) => {
        const rate = this.service.getRate(liquidityPeriod);
        const brbcAmount = Number(usdcAmount) * rate;
        this.brbcAmountCtrl.setValue(brbcAmount, { emitEvent: false });
      });

    this.brbcAmount$
      .pipe(withLatestFrom(this.liquidityPeriod$))
      .subscribe(([brbcAmount, liquidityPeriod]) => {
        const rate = this.service.getRate(liquidityPeriod);
        const usdcAmount = brbcAmount.multipliedBy(1 / rate).toFixed(2);
        this.usdcAmountCtrl.setValue(usdcAmount, {
          emitEvent: false
        });
      });

    this.usdcAmount$
      .pipe(withLatestFrom(this.liquidityPeriod$))
      .subscribe(([usdcAmount, liquidityPeriod]) => {
        if (!usdcAmount.isFinite()) {
          this.brbcAmountCtrl.setValue('', { emitEvent: false });
          return;
        }

        const rate = this.service.getRate(liquidityPeriod);
        const brbcAmount = usdcAmount.multipliedBy(rate).toFixed(2);
        this.brbcAmountCtrl.setValue(brbcAmount, { emitEvent: false });
      });
  }

  public stake(): void {
    const usdcAmount = new BigNumber(this.usdcAmountCtrl.value.toString().split(',').join(''));
    const period = this.liquidityPeriodCtrl.value;
    const depositInProgressNotification$ =
      this.notificationService.showDepositInProgressNotification();
    this._buttonLoading$.next(true);
    this.service
      .stake(usdcAmount, period)
      .pipe(finalize(() => this._buttonLoading$.next(false)))
      .subscribe(v => {
        console.log('balances', v);
        depositInProgressNotification$.unsubscribe();
        this.notificationService.showSuccessDepositNotification();
      });
  }

  public approveTokens(token: 'brbc' | 'usdc'): void {
    this._buttonLoading$.next(true);
    const approveInProgressNotification$ =
      this.notificationService.showApproveInProgressNotification();
    this.service
      .approvePoolToken(token)
      .pipe(
        switchMap(() => this.service.getNeedTokensApprove()),
        finalize(() => this._buttonLoading$.next(false))
      )
      .subscribe(() => {
        approveInProgressNotification$.unsubscribe();
        this.notificationService.showSuccessApproveNotification();
      });
  }

  public setMaxTokenAmount(amount: BigNumber, token: 'brbc' | 'usdc'): void {
    if (token === 'brbc') {
      this.brbcAmountCtrl.setValue(amount.toFixed(2));
    } else {
      this.usdcAmountCtrl.setValue(amount.toFixed(2));
    }
  }

  public setLiquidityTimeHotkey(value: LiquidityPeriodInMonth): void {
    this.liquidityPeriodCtrl.setValue(LIQUIDITY_PERIOD_BY_MONTH[value]);
  }

  public navigateBack(): void {
    this.router.navigate(['liquidity-providing']);
  }

  public async switchNetwork(): Promise<void> {
    await this.service.switchNetwork();
  }
}
