import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';
import { forkJoin, of, Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import { TuiDialogService, TuiNotification, TuiNotificationsService } from '@taiga-ui/core';
import { first } from 'rxjs/operators';
import { TransactionReceipt } from 'web3-eth';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { RubicError } from 'src/app/shared/models/errors/RubicError';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TRADE_STATUS } from 'src/app/shared/models/swaps/TRADE_STATUS';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SwapFormService } from '../../../swaps/services/swaps-form-service/swap-form.service';
import { BridgeService } from '../../services/bridge-service/bridge.service';
import { BridgeTradeRequest } from '../../models/BridgeTradeRequest';
import { SwapsService } from '../../../swaps/services/swaps-service/swaps.service';

interface BlockchainInfo {
  name: string;
  href: string;
}

const BLOCKCHAINS_INFO: { [key in BLOCKCHAIN_NAME]?: BlockchainInfo } = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    name: 'Binance Smart Chain',
    href: 'https://www.binance.org/'
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    name: 'Polygon',
    href: 'https://polygon.technology/'
  },
  [BLOCKCHAIN_NAME.XDAI]: {
    name: 'xDai',
    href: 'https://www.xdaichain.com/'
  },
  [BLOCKCHAIN_NAME.TRON]: {
    name: 'Tron',
    href: 'https://tron.network/'
  }
};

@Component({
  selector: 'app-bridge-bottom-form',
  templateUrl: './bridge-bottom-form.component.html',
  styleUrls: ['./bridge-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BridgeBottomFormComponent implements OnInit, OnDestroy {
  private formSubscription$: Subscription;

  private userSubscription$: Subscription;

  public needApprove: boolean;

  public minmaxError = false;

  public tradeStatus = TRADE_STATUS.DISABLED;

  public TRADE_STATUS = TRADE_STATUS;

  get whatIsBlockchain(): BlockchainInfo {
    const { fromBlockchain, toBlockchain } = this.swapFormService.commonTrade.controls.input.value;
    const nonEthBlockchain =
      fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM ? toBlockchain : fromBlockchain;
    return BLOCKCHAINS_INFO[nonEthBlockchain];
  }

  get address(): string {
    return this.authService.user?.address;
  }

  get tokenInfoUrl(): string {
    const { fromToken, toToken } = this.swapFormService.commonTrade.controls.input.value;
    const tokenAddress = toToken?.address || fromToken?.address;
    return tokenAddress ? `t/${tokenAddress}` : '';
  }

  constructor(
    private bridgeService: BridgeService,
    private errorsService: ErrorsService,
    public swapFormService: SwapFormService,
    private swapService: SwapsService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    private readonly notificationsService: TuiNotificationsService,
    @Inject(Injector) private injector: Injector,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.calculateTrade();
    this.formSubscription$ = this.swapFormService.commonTrade.controls.input.valueChanges.subscribe(
      () => this.calculateTrade()
    );
    this.userSubscription$ = this.authService.getCurrentUser().subscribe(user => {
      if (user?.address) {
        this.calculateTrade();
      }
    });
  }

  ngOnDestroy() {
    this.formSubscription$.unsubscribe();
    this.userSubscription$.unsubscribe();
  }

  public calculateTrade() {
    const { fromBlockchain, toBlockchain, fromToken, toToken, fromAmount } =
      this.swapFormService.commonTrade.controls.input.value;

    if (fromBlockchain === toBlockchain) {
      return;
    }

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

    this.tradeStatus = TRADE_STATUS.LOADING;
    this.cdr.detectChanges();

    const needApprove$ = this.authService.user?.address
      ? this.bridgeService.needApprove()
      : of(false);

    forkJoin([this.bridgeService.getFee(), needApprove$]).subscribe(([fee, needApprove]) => {
      this.needApprove = needApprove;

      if (fee === null) {
        this.errorsService.catch$(new RubicError());
        this.tradeStatus = TRADE_STATUS.DISABLED;
        this.cdr.detectChanges();
        return;
      }

      const toAmount = fromAmount.minus(fee);

      this.swapFormService.commonTrade.controls.output.patchValue({
        toAmount
      });
      this.tradeStatus = needApprove ? TRADE_STATUS.READY_TO_APPROVE : TRADE_STATUS.READY_TO_SWAP;
      this.minmaxError = !this.swapService.checkMinMax(fromAmount);
      if (this.minmaxError || !toAmount || toAmount.isNaN() || toAmount.eq(0)) {
        this.tradeStatus = TRADE_STATUS.DISABLED;
      }
      this.cdr.detectChanges();
    });
  }

  public createTrade() {
    let tradeInProgressSubscription$: Subscription;

    const bridgeTradeRequest: BridgeTradeRequest = {
      toAddress: this.authService.user.address,
      onTransactionHash: () => {
        this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
        this.cdr.detectChanges();
        tradeInProgressSubscription$ = this.notificationsService
          .show(this.translate.instant('bridgePage.progressMessage'), {
            label: 'Trade in progress',
            status: TuiNotification.Info,
            autoClose: false
          })
          .subscribe();
      }
    };

    this.bridgeService
      .createTrade(bridgeTradeRequest)
      .pipe(first())
      .subscribe(
        (_res: TransactionReceipt) => {
          tradeInProgressSubscription$.unsubscribe();

          this.notificationsService
            .show(this.translate.instant('bridgePage.successMessage'), {
              label: 'Successful trade',
              status: TuiNotification.Success,
              autoClose: 15000
            })
            .subscribe();
          this.tradeStatus = null;
          this.cdr.detectChanges();
          this.calculateTrade();
        },
        err => {
          tradeInProgressSubscription$?.unsubscribe();
          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.errorsService.catch$(err);
        }
      );
  }

  public approveTrade() {
    let approveInProgressSubscription$: Subscription;

    const bridgeTradeRequest: BridgeTradeRequest = {
      onTransactionHash: () => {
        this.tradeStatus = TRADE_STATUS.APPROVE_IN_PROGRESS;
        this.cdr.detectChanges();
        approveInProgressSubscription$ = this.notificationsService
          .show(this.translate.instant('bridgePage.approveProgressMessage'), {
            label: 'Approve in progress',
            status: TuiNotification.Info,
            autoClose: false
          })
          .subscribe();
      }
    };

    this.bridgeService
      .approve(bridgeTradeRequest)
      .pipe(first())
      .subscribe(
        (_res: TransactionReceipt) => {
          approveInProgressSubscription$.unsubscribe();

          this.notificationsService
            .show(this.translate.instant('bridgePage.approveSuccessMessage'), {
              label: 'Successful approve',
              status: TuiNotification.Success,
              autoClose: 15000
            })
            .subscribe();
          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.cdr.detectChanges();
        },
        err => {
          approveInProgressSubscription$?.unsubscribe();
          this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
          this.errorsService.catch$(err);
        }
      );
  }
}
