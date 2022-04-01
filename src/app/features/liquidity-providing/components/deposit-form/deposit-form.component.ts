import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  debounceTime,
  filter,
  finalize,
  map,
  skip,
  startWith,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import { LiquidityProvidingService } from '../../services/liquidity-providing.service';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { Router } from '@angular/router';
import { LiquidityProvidingNotificationsService } from '../../services/liquidity-providing-notifications.service';
import { LiquidityProvidingModalsService } from '../../services/liquidity-providing-modals.service';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { WalletsModalService } from '@app/core/wallets/services/wallets-modal.service';
import { PoolToken } from '../../models/pool-token.enum';

@Component({
  selector: 'app-deposit-form',
  templateUrl: './deposit-form.component.html',
  styleUrls: ['./deposit-form.component.scss'],
  providers: [TuiDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositFormComponent implements OnInit {
  public readonly poolToken = PoolToken;

  public readonly brbcAmountCtrl = new FormControl(0);

  public readonly usdcAmountCtrl = new FormControl();

  private readonly _rbcAmountUsdPrice$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly rbcAmountUsdPrice$ = this._rbcAmountUsdPrice$.asObservable();

  private readonly _usdcAmountUsdPrice$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly usdcAmountUsdPrice$ = this._usdcAmountUsdPrice$.asObservable();

  public readonly usdcBalance$ = this.service.usdcBalance$;

  public readonly brbcBalance$ = this.service.brbcBalance$;

  private readonly _buttonLoading$ = new BehaviorSubject<boolean>(false);

  public readonly buttonLoading$ = this._buttonLoading$.asObservable();

  private readonly _usdcDepositOpened$ = new BehaviorSubject<boolean>(false);

  public readonly usdcDepositOpened$ = this._usdcDepositOpened$.asObservable();

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
    takeUntil(this.destroy$)
  );

  constructor(
    private readonly service: LiquidityProvidingService,
    private readonly notificationService: LiquidityProvidingNotificationsService,
    private readonly router: Router,
    private readonly walletsModalService: WalletsModalService,
    private readonly lpProvidingModalService: LiquidityProvidingModalsService,
    private readonly destroy$: TuiDestroyService,
    private readonly cdr: ChangeDetectorRef,
    private readonly walletConnectorService: WalletConnectorService
  ) {}

  ngOnInit(): void {
    this.brbcAmount$.pipe(skip(1), debounceTime(500)).subscribe(() => {
      this._usdcDepositOpened$.next(true);
    });

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
    // this.liquidityPeriod$
    //   .pipe(withLatestFrom(this.usdcAmount$))
    //   .subscribe(([liquidityPeriod, usdcAmount]) => {
    //     const rate = this.service.getRate(liquidityPeriod);
    //     const brbcAmount = (Number(usdcAmount) * rate).toFixed(2);
    //     this.brbcAmountCtrl.setValue(brbcAmount, { emitEvent: false });
    //   });
    // this.brbcAmount$
    //   .pipe(withLatestFrom(this.liquidityPeriod$))
    //   .subscribe(([brbcAmount, liquidityPeriod]) => {
    //     this._usdcDepositOpened$.next(true);
    //     const rate = this.service.getRate(liquidityPeriod);
    //     const usdcAmount = brbcAmount.multipliedBy(1 / rate).toFixed(2);
    //     this.usdcAmountCtrl.setValue(usdcAmount, {
    //       emitEvent: false
    //     });
    //   });
    // this.usdcAmount$
    //   .pipe(withLatestFrom(this.liquidityPeriod$))
    //   .subscribe(([usdcAmount, liquidityPeriod]) => {
    //     if (!usdcAmount.isFinite()) {
    //       this.brbcAmountCtrl.setValue('', { emitEvent: false });
    //       return;
    //     }
    //     const rate = this.service.getRate(liquidityPeriod);
    //     const brbcAmount = usdcAmount.multipliedBy(rate).toFixed(2);
    //     this.brbcAmountCtrl.setValue(brbcAmount, { emitEvent: false });
    //   });
  }

  public createDeposit(): void {
    const usdcAmount = new BigNumber(this.usdcAmountCtrl.value.toString().split(',').join(''));
    const period = 111;
    const depositInProgressNotification$ =
      this.notificationService.showDepositInProgressNotification();
    this._buttonLoading$.next(true);

    this.service
      .createDeposit(usdcAmount, period)
      .pipe(finalize(() => this._buttonLoading$.next(false)))
      .subscribe(v => {
        console.log('balances', v);
        depositInProgressNotification$.unsubscribe();
        this.notificationService.showSuccessDepositNotification();
      });
  }

  public approveTokens(token: PoolToken): void {
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

  public setMaxTokenAmount(amount: BigNumber, token: PoolToken): void {
    switch (token) {
      case PoolToken.BRBC:
        this.brbcAmountCtrl.setValue(amount.toFixed(5));
        break;
      case PoolToken.USDC:
        this.usdcAmountCtrl.setValue(amount.toFixed(5));
        break;
    }
  }

  public navigateBack(): void {
    this.router.navigate(['liquidity-providing']);
  }

  public async switchNetwork(): Promise<void> {
    await this.service.switchNetwork();
  }

  public login(): void {
    this.walletsModalService.open().subscribe();
  }
}
