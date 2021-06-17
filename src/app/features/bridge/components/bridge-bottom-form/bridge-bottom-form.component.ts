import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import { TuiDialogService, TuiNotification, TuiNotificationsService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { first } from 'rxjs/operators';
import { TransactionReceipt } from 'web3-eth';
import { TranslateService } from '@ngx-translate/core';
import { BridgeService } from '../../services/bridge-service/bridge.service';
import { ErrorsService } from '../../../../core/errors/errors.service';
import { RubicError } from '../../../../shared/models/errors/RubicError';
import { SwapFormService } from '../../../swaps/services/swaps-form-service/swap-form.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { WalletsModalComponent } from '../../../../core/header/components/header/components/wallets-modal/wallets-modal.component';
import { BridgeTradeRequest } from '../../models/BridgeTradeRequest';
import { SwapsService } from '../../../swaps/services/swaps-service/swaps.service';

@Component({
  selector: 'app-bridge-bottom-form',
  templateUrl: './bridge-bottom-form.component.html',
  styleUrls: ['./bridge-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BridgeBottomFormComponent implements OnInit, OnDestroy {
  private formSubscription$: Subscription;

  private userSubscription$: Subscription;

  public loading = false;

  public isAuthorized: boolean;

  public tradeInProgress = false;

  public minmaxError = false;

  get disabled(): boolean {
    if (this.loading || this.tradeInProgress || this.minmaxError) {
      return true;
    }
    const { toAmount } = this.swapFormService.commonTrade.controls.output.value;
    return !toAmount || toAmount.isNaN() || toAmount.eq(0);
  }

  constructor(
    private bridgeService: BridgeService,
    private errorsService: ErrorsService,
    private swapFormService: SwapFormService,
    private swapService: SwapsService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    private readonly notificationsService: TuiNotificationsService,
    @Inject(Injector) private injector: Injector,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.swapFormService.commonTrade.controls.input.valueChanges.subscribe(() =>
      this.calculateTrade()
    );

    this.userSubscription$ = this.authService.getCurrentUser().subscribe(user => {
      this.isAuthorized = !!user?.address;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.formSubscription$.unsubscribe();
    this.userSubscription$.unsubscribe();
  }

  public calculateTrade() {
    const { fromBlockchain, toBlockchain, fromToken, toToken, fromAmount } =
      this.swapFormService.commonTrade.controls.input.value;
    if (
      !fromBlockchain ||
      !toBlockchain ||
      !fromToken ||
      !toToken ||
      !fromAmount ||
      fromAmount.eq(0) ||
      fromAmount.isNaN()
    ) {
      this.swapFormService.commonTrade.controls.output.patchValue({
        toAmount: new BigNumber(NaN)
      });
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.bridgeService.getFee().subscribe(fee => {
      if (fee === null) {
        this.errorsService.catch$(new RubicError());
        return;
      }

      this.swapFormService.commonTrade.controls.output.patchValue({
        toAmount: fromAmount.minus(fee)
      });
      this.loading = false;
      this.minmaxError = !this.swapService.checkMinMax(fromAmount);
      this.cdr.detectChanges();
    });
  }

  public onButtonClick() {
    if (!this.isAuthorized) {
      this.dialogService
        .open(new PolymorpheusComponent(WalletsModalComponent, this.injector), { size: 's' })
        .subscribe();
      return;
    }
    this.createTrade();
  }

  public createTrade() {
    const bridgeTradeRequest: BridgeTradeRequest = {
      toAddress: this.authService.user.address,
      onTransactionHash: () => {
        this.tradeInProgress = true;
        this.notificationsService
          .show(this.translate.instant('bridgePage.progressMessage'), {
            label: 'Trade in progress',
            status: TuiNotification.Info
          })
          .subscribe();
      }
    };

    this.bridgeService
      .createTrade(bridgeTradeRequest)
      .pipe(first())
      .subscribe(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (res: TransactionReceipt) => {
          this.notificationsService
            .show(this.translate.instant('bridgePage.successMessage'), {
              label: 'Successful trade',
              status: TuiNotification.Success
            })
            .subscribe();
          this.tradeInProgress = false;
        },
        err => {
          this.tradeInProgress = false;
          this.errorsService.catch$(err);
        }
      );
  }
}
