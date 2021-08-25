import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CryptoTapFormService } from 'src/app/features/crypto-tap/services/crypto-tap-form-service/crypto-tap-form.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { blockchainsList } from 'src/app/features/swaps/constants/BlockchainsList';
import { FromToAvailableTokens } from 'src/app/features/crypto-tap/models/FromToAvailableTokens';
import { CryptoTapTokensService } from 'src/app/features/crypto-tap/services/crypto-tap-tokens-service/crypto-tap-tokens.service';
import { of, Subscription, throwError } from 'rxjs';
import { CryptoTapService } from 'src/app/features/crypto-tap/services/crypto-tap-service/crypto-tap.service';
import { TRADE_STATUS } from 'src/app/shared/models/swaps/TRADE_STATUS';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { filter, first, mergeMap, tap } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { CryptoTapTrade } from 'src/app/features/crypto-tap/models/CryptoTapTrade';
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { TransactionReceipt } from 'web3-eth';
import { TranslateService } from '@ngx-translate/core';
import { UndefinedError } from 'src/app/core/errors/models/undefined.error';
import { SWAP_PROVIDER_TYPE } from 'src/app/features/swaps/models/SwapProviderType';
import { NotificationsService } from 'src/app/core/services/notifications/notifications.service';
import { SuccessTxModalComponent } from 'src/app/shared/components/success-tx-modal/success-tx-modal.component';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-crypto-tap-form',
  templateUrl: './crypto-tap-form.component.html',
  styleUrls: ['./crypto-tap-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CryptoTapFormComponent implements OnInit, OnDestroy {
  public swapType = SWAP_PROVIDER_TYPE.CRYPTO_TAP;

  public fromBlockchain = BLOCKCHAIN_NAME.ETHEREUM;

  public toBlockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

  public tokensLoading = true;

  public TRADE_STATUS = TRADE_STATUS;

  public tradeStatus = TRADE_STATUS.DISABLED;

  public needApprove = false;

  public $tokensSubscription: Subscription;

  public $formSubscription: Subscription;

  public $blockchainSubscription: Subscription;

  public $outputSubscription: Subscription;

  public $userSubscription: Subscription;

  public $tradeInProgressSubscription: Subscription;

  public blockchainsListFrom = blockchainsList
    .filter(blockchain => blockchain.symbol === BLOCKCHAIN_NAME.ETHEREUM)
    .map(blockchain => blockchain.symbol);

  public blockchainsListTo = blockchainsList
    .filter(
      blockchain =>
        blockchain.symbol === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ||
        blockchain.symbol === BLOCKCHAIN_NAME.POLYGON
    )
    .map(blockchain => blockchain.symbol);

  public availableTokens: FromToAvailableTokens = {
    from: [],
    to: []
  };

  public fromAmount: BigNumber;

  constructor(
    private cdr: ChangeDetectorRef,
    private cryptoTapService: CryptoTapService,
    public cryptoTapFormService: CryptoTapFormService,
    private cryptoTapTokenService: CryptoTapTokensService,
    private authService: AuthService,
    private errorsService: ErrorsService,
    private translate: TranslateService,
    private readonly notificationsService: NotificationsService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  ngOnInit(): void {
    this.$tokensSubscription = this.cryptoTapTokenService.availableTokens$.subscribe(tokens => {
      if (!tokens.from?.length) {
        return;
      }

      const { toBlockchain } = this.cryptoTapFormService.commonTrade.controls.input.value;
      this.toBlockchain = toBlockchain;
      this.cryptoTapFormService.commonTrade.controls.input.patchValue({
        toToken: tokens.to.find(token => token.blockchain === toBlockchain)
      });

      this.availableTokens = tokens;
      this.tokensLoading = false;
      this.cdr.detectChanges();
    });

    this.$blockchainSubscription =
      this.cryptoTapFormService.commonTrade.controls.input.controls.toBlockchain.valueChanges.subscribe(
        toBlockchain => {
          const tokens = this.cryptoTapTokenService.availableTokens.to;
          if (tokens.length) {
            setTimeout(() =>
              this.cryptoTapFormService.commonTrade.controls.input.patchValue({
                toToken: tokens.find(token => token.blockchain === toBlockchain)
              })
            );
          }
        }
      );

    this.$formSubscription =
      this.cryptoTapFormService.commonTrade.controls.input.valueChanges.subscribe(() =>
        this.calculateTrade()
      );

    this.$outputSubscription =
      this.cryptoTapFormService.commonTrade.controls.output.valueChanges.subscribe(outputValue => {
        this.fromAmount = outputValue.fromAmount;
      });

    this.$userSubscription = this.authService
      .getCurrentUser()
      .pipe(filter(user => !!user?.address))
      .subscribe(() => this.calculateTrade());
  }

  ngOnDestroy() {
    this.$tokensSubscription.unsubscribe();
    this.$blockchainSubscription.unsubscribe();
    this.$formSubscription.unsubscribe();
    this.$outputSubscription.unsubscribe();
    this.$userSubscription.unsubscribe();
  }

  private calculateTrade() {
    const { fromToken, toToken } = this.cryptoTapFormService.commonTrade.controls.input.value;
    if (!fromToken || !toToken) {
      this.cryptoTapFormService.commonTrade.controls.output.patchValue({
        toAmount: new BigNumber(0),
        fromAmount: new BigNumber(0),
        fee: {
          token: null,
          amount: new BigNumber(0)
        }
      });
      this.tradeStatus = TRADE_STATUS.DISABLED;
      return;
    }

    this.tradeStatus = TRADE_STATUS.LOADING;
    this.cdr.detectChanges();

    this.cryptoTapService
      .calculateTrade()
      .pipe(
        tap((trade: CryptoTapTrade) => {
          const { toAmount, fromAmount, fee } = trade;
          if (
            this.isBNIncorrect(toAmount) ||
            this.isBNIncorrect(fromAmount) ||
            this.isBNIncorrect(fee)
          ) {
            console.error('Incorrect crypto tap output parameters');
            throwError(new UndefinedError());
          }

          this.cryptoTapFormService.commonTrade.controls.output.patchValue({
            toAmount,
            fromAmount,
            fee: {
              token: fromToken,
              amount: fee
            }
          });
        }),
        mergeMap((trade: CryptoTapTrade) =>
          this.authService.user?.address
            ? this.cryptoTapService.needApprove(trade.fromAmount)
            : of(false)
        )
      )
      .subscribe(
        (needApprove: boolean) => {
          this.needApprove = needApprove;
          if (needApprove) {
            this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
          } else {
            this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          }
          this.cdr.detectChanges();
        },
        err => this.errorsService.catch(err)
      );
  }

  private isBNIncorrect(bn: BigNumber): boolean {
    return !bn.isFinite() || bn.eq(0) || bn.isNaN();
  }

  public approveTrade() {
    let approveInProgressSubscription$: Subscription;

    const onTransactionHash = () => {
      this.tradeStatus = TRADE_STATUS.APPROVE_IN_PROGRESS;
      this.cdr.detectChanges();
      approveInProgressSubscription$ = this.notificationsService.show(
        this.translate.instant('bridgePage.progressMessage'),
        {
          label: 'Trade in progress',
          status: TuiNotification.Info,
          autoClose: false
        }
      );
    };

    this.cryptoTapService
      .approve(onTransactionHash)
      .pipe(first())
      .subscribe(
        (_res: TransactionReceipt) => {
          approveInProgressSubscription$.unsubscribe();

          this.notificationsService.show(this.translate.instant('bridgePage.successMessage'), {
            label: 'Successful trade',
            status: TuiNotification.Success,
            autoClose: 15000
          });
          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.cdr.detectChanges();
        },
        err => {
          approveInProgressSubscription$?.unsubscribe();
          this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
          this.errorsService.catch(err);
        }
      );
  }

  public createTrade() {
    let tradeInProgressSubscription$: Subscription;

    const onTransactionHash = () => {
      this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
      this.cdr.detectChanges();
      this.notifyTradeInProgress();
    };

    this.cryptoTapService
      .createTrade(onTransactionHash)
      .pipe(first())
      .subscribe(
        (_res: TransactionReceipt) => {
          tradeInProgressSubscription$.unsubscribe();

          this.notificationsService.show(this.translate.instant('bridgePage.successMessage'), {
            label: 'Successful trade',
            status: TuiNotification.Success,
            autoClose: 15000
          });
          this.tradeStatus = null;
          this.cdr.detectChanges();
          this.calculateTrade();
        },
        err => {
          tradeInProgressSubscription$?.unsubscribe();
          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.errorsService.catch(err);
        }
      );
  }

  private notifyTradeInProgress() {
    this.$tradeInProgressSubscription = this.notificationsService.show(
      this.translate.instant('bridgePage.progressMessage'),
      {
        label: 'Trade in progress',
        status: TuiNotification.Info,
        autoClose: false
      }
    );
    if (window.location.pathname === '/crypto-tap') {
      this.dialogService
        .open(new PolymorpheusComponent(SuccessTxModalComponent, this.injector), {
          size: 's',
          data: { idPrefix: 'crypto_tap_' }
        })
        .subscribe();
    }
  }
}
