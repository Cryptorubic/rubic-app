import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
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

@Component({
  selector: 'app-deposit-form',
  templateUrl: './deposit-form.component.html',
  styleUrls: ['./deposit-form.component.scss'],
  providers: [TuiDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositFormComponent implements OnInit, OnDestroy {
  public readonly poolToken = PoolToken;

  public readonly brbcAmountCtrl = new FormControl(0);

  public readonly usdcAmountCtrl = new FormControl({ value: 0, disabled: true });

  private readonly _rbcAmountUsdPrice$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly rbcAmountUsdPrice$ = this._rbcAmountUsdPrice$.asObservable();

  private readonly _usdcAmountUsdPrice$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  public readonly usdcAmountUsdPrice$ = this._usdcAmountUsdPrice$.asObservable();

  public readonly usdcBalance$ = this.lpService.usdcBalance$;

  public readonly brbcBalance$ = this.lpService.brbcBalance$;

  private readonly _buttonLoading$ = new BehaviorSubject<boolean>(false);

  public readonly buttonLoading$ = this._buttonLoading$.asObservable();

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
    private readonly notificationService: LiquidityProvidingNotificationService,
    private readonly router: Router,
    private readonly walletsModalService: WalletsModalService,
    private readonly destroy$: TuiDestroyService,
    private readonly cdr: ChangeDetectorRef,
    private readonly themeService: ThemeService,
    private readonly walletConnectorService: WalletConnectorService
  ) {}

  ngOnInit(): void {
    this.brbcAmount$.pipe(skip(1), debounceTime(150)).subscribe(value => {
      if (!value.isFinite()) {
        this.usdcAmountCtrl.reset();
        this._usdcDepositOpened$.next(false);
      } else {
        this.usdcAmountCtrl.patchValue(value);
        this._usdcDepositOpened$.next(true);
      }
    });

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

    this.walletConnectorService.addressChange$.pipe(takeUntil(this.destroy$)).subscribe(address => {
      if (!this.lpService.checkIsWhitelistUser(address) && this.lpService.isWhitelistInProgress) {
        this.router.navigate(['liquidity-providing']);
      }
    });
  }

  public createDeposit(): void {
    const amount = this.lpService.parseInputValue(this.usdcAmountCtrl.value);

    this.lpModalService
      .showDepositModal(amount)
      .pipe(
        switchMap(result => {
          if (result) {
            this._buttonLoading$.next(true);
            return this.lpService
              .createDeposit(amount)
              .pipe(finalize(() => this._buttonLoading$.next(false)));
          } else {
            return of(false);
          }
        })
      )
      .subscribe(makeDeposit => {
        if (makeDeposit) {
          this.notificationService.showSuccessDepositNotification();
          this.router.navigate(['liquidity-providing']);
        }
      });
  }

  public approveTokens(token: PoolToken): void {
    this._buttonLoading$.next(true);

    this.lpService
      .approvePoolToken(token)
      .pipe(
        switchMap(() => this.lpService.getNeedTokensApprove()),
        finalize(() => this._buttonLoading$.next(false))
      )
      .subscribe(() => {
        this.notificationService.showSuccessApproveNotification();
        this.cdr.detectChanges();
      });
  }

  public setMaxTokenAmount(amount: BigNumber): void {
    this.brbcAmountCtrl.setValue(amount.toFixed(2));
    this.usdcAmountCtrl.setValue(amount.toFixed(2));
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

  public ngOnDestroy(): void {
    this.lpService.stopWatchWhitelist();
  }
}
