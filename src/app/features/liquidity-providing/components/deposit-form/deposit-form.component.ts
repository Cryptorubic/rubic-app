import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { filter, finalize, map, skip, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { LiquidityProvidingService } from '../../services/liquidity-providing.service';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { Router } from '@angular/router';
import { LiquidityProvidingNotificationService } from '../../services/liquidity-providing-notification.service';
import { WalletsModalService } from '@app/core/wallets/services/wallets-modal.service';
import { PoolToken } from '../../models/pool-token.enum';
import { DepositType } from '../../models/deposit-type.enum';
import { ThemeService } from '@app/core/services/theme/theme.service';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { LiquidityProvidingModalService } from '../../services/liquidity-providing-modals.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { DEPOSIT_RATIO } from '../../constants/DEPOSIT_RATIO';

@Component({
  selector: 'app-deposit-form',
  templateUrl: './deposit-form.component.html',
  styleUrls: ['./deposit-form.component.scss'],
  providers: [TuiDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositFormComponent implements OnInit {
  public readonly poolToken = PoolToken;

  public readonly brbcAmountCtrl = new FormControl(null);

  public readonly usdcAmountCtrl = new FormControl({ value: 0, disabled: true });

  private readonly _rbcAmountUsdPrice$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly rbcAmountUsdPrice$ = this._rbcAmountUsdPrice$.asObservable();

  private readonly _usdcAmountUsdPrice$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  public readonly usdcAmountUsdPrice$ = this._usdcAmountUsdPrice$.asObservable();

  public readonly usdcBalance$ = this.lpService.usdcBalance$;

  public readonly brbcBalance$ = this.lpService.brbcBalance$;

  private readonly _loadingDepositBtn$ = new BehaviorSubject<boolean>(false);

  public readonly loadingDepositBtn$ = this._loadingDepositBtn$.asObservable();

  private readonly _loadingBrbcApproveBtn$ = new BehaviorSubject<boolean>(false);

  public readonly loadingBrbcApproveBtn$ = this._loadingBrbcApproveBtn$.asObservable();

  private readonly _loadingUsdcApproveBtn$ = new BehaviorSubject<boolean>(false);

  public readonly loadingUsdcApproveBtn$ = this._loadingUsdcApproveBtn$.asObservable();

  private readonly _usdcDepositOpened$ = new BehaviorSubject<boolean>(false);

  public readonly usdcDepositOpened$ = this._usdcDepositOpened$.asObservable();

  public readonly brbcAmount$ = this.brbcAmountCtrl.valueChanges.pipe(
    startWith(this.brbcAmountCtrl.value),
    map(value => this.lpService.parseInputValue(value)),
    tap(async amount => {
      const amountUsdPrice = await this.lpService.calculateBrbcUsdPrice(new BigNumber(amount));
      this._rbcAmountUsdPrice$.next(amountUsdPrice);
    }),
    takeUntil(this.destroy$)
  );

  public readonly usdcAmount$ = this.usdcAmountCtrl.valueChanges.pipe(
    startWith(this.usdcAmountCtrl.value),
    map(value => this.lpService.parseInputValue(value)),
    takeUntil(this.destroy$)
  );

  public readonly depositType = DepositType;

  public readonly isDarkTheme$ = this.themeService.theme$.pipe(map(theme => theme === 'dark'));

  constructor(
    private readonly lpService: LiquidityProvidingService,
    private readonly lpModalService: LiquidityProvidingModalService,
    private readonly lpNotificationService: LiquidityProvidingNotificationService,
    private readonly router: Router,
    private readonly walletsModalService: WalletsModalService,
    private readonly destroy$: TuiDestroyService,
    private readonly cdr: ChangeDetectorRef,
    private readonly themeService: ThemeService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getUserTotalStaked();
    this.handleBrbcInput();
    this.watchAddressApprove();
  }

  public createDeposit(): void {
    const brbcAmount = this.lpService.parseInputValue(this.brbcAmountCtrl.value);
    const usdcAmount = this.lpService.parseInputValue(this.usdcAmountCtrl.value);

    this.lpModalService
      .showDepositModal(brbcAmount, usdcAmount)
      .pipe(
        switchMap(result => {
          if (result) {
            this._loadingDepositBtn$.next(true);
            return this.lpService
              .createDeposit(usdcAmount)
              .pipe(finalize(() => this._loadingDepositBtn$.next(false)));
          } else {
            return of(false);
          }
        })
      )
      .subscribe(makeDeposit => {
        if (makeDeposit) {
          this.lpNotificationService.showSuccessDepositNotification();
          this.router.navigate(['liquidity-providing']);
        }
      });
  }

  public approveTokens(token: PoolToken): void {
    this.setApproveBtnLoading(token, true);

    this.lpService
      .approvePoolToken(token)
      .pipe(
        switchMap(() => this.lpService.getNeedTokensApprove()),
        finalize(() => this.setApproveBtnLoading(token, false))
      )
      .subscribe(() => {
        this.lpNotificationService.showSuccessApproveNotification(token);
        this.cdr.detectChanges();
      });
  }

  private setApproveBtnLoading(token: PoolToken, value: boolean): void {
    if (token === PoolToken.BRBC) {
      this._loadingBrbcApproveBtn$.next(value);
    } else {
      this._loadingUsdcApproveBtn$.next(value);
    }
  }

  public setMaxTokenAmount(brbcAmount: BigNumber): void {
    this.usdcAmountCtrl.setValue(brbcAmount.multipliedBy(DEPOSIT_RATIO).toFixed(2));
    this.brbcAmountCtrl.setValue(brbcAmount.toFixed(2));
  }

  public navigateBack(): void {
    this.router.navigate(['liquidity-providing']);
  }

  public async switchNetwork(): Promise<void> {
    await this.lpService.switchNetwork();
  }

  public login(): void {
    this.walletsModalService.open().subscribe();
  }

  private getUserTotalStaked(): void {
    this.authService
      .getCurrentUser()
      .pipe(
        filter(user => Boolean(user?.address)),
        switchMap(() => this.lpService.getUserTotalStaked()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private watchAddressApprove(): void {
    this.lpService.userAddress$
      .pipe(
        filter(user => Boolean(user?.address)),
        switchMap(() => {
          return forkJoin([
            this.lpService.getAndUpdatePoolTokensBalances(),
            this.lpService.getNeedTokensApprove()
          ]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private handleBrbcInput(): void {
    this.brbcAmount$.pipe(skip(1)).subscribe(value => {
      if (!value.isFinite()) {
        this.usdcAmountCtrl.reset();
        this._usdcDepositOpened$.next(false);
      } else {
        const usdcAmount = value.multipliedBy(DEPOSIT_RATIO);
        this.usdcAmountCtrl.patchValue(usdcAmount);
        this._usdcDepositOpened$.next(true);
      }
    });
  }
}
