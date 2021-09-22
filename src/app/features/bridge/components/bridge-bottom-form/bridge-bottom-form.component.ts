import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { forkJoin, of, Subject, Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  startWith,
  switchMap,
  takeUntil
} from 'rxjs/operators';
import { TransactionReceipt } from 'web3-eth';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TRADE_STATUS } from 'src/app/shared/models/swaps/TRADE_STATUS';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SettingsService } from 'src/app/features/swaps/services/settings-service/settings.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { UndefinedError } from 'src/app/core/errors/models/undefined.error';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { SwapFormInput } from 'src/app/features/swaps/models/SwapForm';
import { BridgeTokenPairsByBlockchains } from 'src/app/features/bridge/models/BridgeTokenPairsByBlockchains';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { NotificationsService } from 'src/app/core/services/notifications/notifications.service';
import { CounterNotificationsService } from 'src/app/core/services/counter-notifications/counter-notifications.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ReceiveWarningModalComponent } from 'src/app/features/bridge/components/bridge-bottom-form/components/receive-warning-modal/receive-warning-modal';
import { TrackTransactionModalComponent } from 'src/app/features/bridge/components/bridge-bottom-form/components/track-transaction-modal/track-transaction-modal';
import { SuccessTxModalService } from 'src/app/features/swaps/services/success-tx-modal-service/success-tx-modal.service';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SuccessTrxNotificationComponent } from 'src/app/shared/components/success-trx-notification/success-trx-notification.component';
import { WINDOW } from '@ng-web-apis/common';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class BridgeBottomFormComponent implements OnInit, OnDestroy {
  @Input() loading: boolean;

  @Input() tokens: AvailableTokenAmount[];

  public readonly TRADE_STATUS = TRADE_STATUS;

  public readonly BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  private readonly onCalculateTrade$: Subject<void>;

  private bridgeTokenPairsByBlockchainsArray: BridgeTokenPairsByBlockchains[];

  private fromBlockchain: BLOCKCHAIN_NAME;

  public toBlockchain: BLOCKCHAIN_NAME;

  public isBridgeSupported: boolean;

  private fromToken: TokenAmount;

  private toToken: TokenAmount;

  public fromAmount: BigNumber;

  public minError: false | number;

  public maxError: false | number;

  public toWalletAddress: string;

  public tronAddress: string;

  public needApprove: boolean;

  public tradeStatus: TRADE_STATUS;

  private calculateTradeSubscription$: Subscription;

  private tradeInProgressSubscription$: Subscription;

  get allowTrade(): boolean {
    const { fromBlockchain, toBlockchain, fromToken, toToken, fromAmount } =
      this.swapFormService.inputValue;
    return (
      fromBlockchain &&
      toBlockchain &&
      fromToken &&
      toToken &&
      fromAmount &&
      !fromAmount.isNaN() &&
      fromAmount.gt(0)
    );
  }

  get whatIsBlockchain(): BlockchainInfo {
    const { fromBlockchain, toBlockchain } = this.swapFormService.inputValue;
    const nonEthBlockchain =
      toBlockchain === BLOCKCHAIN_NAME.ETHEREUM ? fromBlockchain : toBlockchain;
    return BLOCKCHAINS_INFO[nonEthBlockchain];
  }

  constructor(
    private bridgeService: BridgeService,
    private errorsService: ErrorsService,
    public swapFormService: SwapFormService,
    private swapService: SwapsService,
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private web3PublicService: Web3PublicService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    private readonly destroy$: TuiDestroyService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly translateService: TranslateService,
    private readonly tokensService: TokensService,
    private readonly notificationsService: NotificationsService,
    private readonly counterNotificationsService: CounterNotificationsService,
    private readonly successTxModalService: SuccessTxModalService,
    private readonly iframeService: IframeService,
    @Inject(WINDOW) private readonly window: Window
  ) {
    this.isBridgeSupported = true;
    this.onCalculateTrade$ = new Subject<void>();
  }

  ngOnInit() {
    this.setupTradeCalculation();
    this.tradeStatus = TRADE_STATUS.DISABLED;

    this.bridgeService.tokens.pipe(takeUntil(this.destroy$)).subscribe(tokens => {
      this.bridgeTokenPairsByBlockchainsArray = tokens;
    });

    this.swapFormService.inputValueChanges
      .pipe(
        startWith(this.swapFormService.inputValue),
        distinctUntilChanged((prev, next) => {
          return (
            prev.toBlockchain === next.toBlockchain &&
            prev.fromBlockchain === next.fromBlockchain &&
            prev.fromToken?.address === next.fromToken?.address &&
            prev.toToken?.address === next.toToken?.address &&
            prev.fromAmount === next.fromAmount
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(form => this.setFormValues(form));

    this.settingsService.bridgeValueChanges
      .pipe(startWith(this.settingsService.bridgeValue), takeUntil(this.destroy$))
      .subscribe(settings => {
        this.tronAddress = settings.tronAddress;
        this.setToWalletAddress();
      });

    this.authService
      .getCurrentUser()
      .pipe(
        filter(user => !!user?.address),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.setToWalletAddress();
        this.conditionalCalculate();
      });
  }

  public ngOnDestroy(): void {
    this.calculateTradeSubscription$.unsubscribe();
  }

  private setFormValues(form: SwapFormInput): void {
    this.fromBlockchain = form.fromBlockchain;
    this.toBlockchain = form.toBlockchain;
    this.fromToken = form.fromToken;
    this.toToken = form.toToken;
    this.fromAmount = form.fromAmount;
    this.cdr.detectChanges();

    this.setToWalletAddress();

    this.conditionalCalculate();
  }

  private setToWalletAddress(): void {
    const { toBlockchain } = this.swapFormService.inputValue;
    if (toBlockchain === BLOCKCHAIN_NAME.TRON) {
      this.toWalletAddress = this.tronAddress;
    } else {
      this.toWalletAddress = this.authService.user?.address;
    }
    this.cdr.detectChanges();
  }

  private async conditionalCalculate(): Promise<void> {
    if (!this.fromToken?.address || !this.toToken?.address) {
      this.maxError = false;
      this.minError = false;
    }

    const { fromBlockchain, toBlockchain } = this.swapFormService.inputValue;
    if (fromBlockchain === toBlockchain) {
      return;
    }

    if (!(await this.bridgeService.isBridgeSupported())) {
      this.tradeStatus = TRADE_STATUS.DISABLED;
      this.isBridgeSupported = false;
      this.cdr.detectChanges();
      return;
    }

    this.isBridgeSupported = true;
    this.cdr.detectChanges();

    if (!this.allowTrade) {
      this.tradeStatus = TRADE_STATUS.DISABLED;
      this.swapFormService.output.patchValue({
        toAmount: new BigNumber(NaN)
      });
      this.cdr.detectChanges();
      return;
    }

    this.checkMinMaxAmounts();
    this.onCalculateTrade$.next();
  }

  private setupTradeCalculation(): void {
    if (this.calculateTradeSubscription$) {
      return;
    }

    this.calculateTradeSubscription$ = this.onCalculateTrade$
      .pipe(
        switchMap(() => {
          this.tradeStatus = TRADE_STATUS.LOADING;
          this.cdr.detectChanges();

          const needApprove$ = this.authService.user?.address
            ? this.bridgeService.needApprove()
            : of(false);

          return forkJoin([this.bridgeService.getFee(), needApprove$]).pipe(
            map(([fee, needApprove]) => {
              this.needApprove = needApprove;

              if (fee === null) {
                this.tradeStatus = TRADE_STATUS.DISABLED;
                this.errorsService.catch(new UndefinedError());
                this.cdr.detectChanges();
                return;
              }

              const { fromAmount } = this.swapFormService.inputValue;
              const toAmount = fromAmount.minus(fee);
              this.swapFormService.output.patchValue({
                toAmount
              });

              if (
                this.minError ||
                this.maxError ||
                !toAmount ||
                toAmount.isNaN() ||
                toAmount.eq(0) ||
                !this.toWalletAddress
              ) {
                this.tradeStatus = TRADE_STATUS.DISABLED;
              } else {
                this.tradeStatus = needApprove
                  ? TRADE_STATUS.READY_TO_APPROVE
                  : TRADE_STATUS.READY_TO_SWAP;
              }
              this.cdr.detectChanges();
            })
          );
        })
      )
      .subscribe();
  }

  public async approveTrade(): Promise<void> {
    this.tradeStatus = TRADE_STATUS.APPROVE_IN_PROGRESS;
    this.cdr.detectChanges();

    let approveInProgressSubscription$: Subscription;
    const bridgeTradeRequest: BridgeTradeRequest = {
      onTransactionHash: () => {
        this.cdr.detectChanges();
        approveInProgressSubscription$ = this.notificationsService.show(
          this.translateService.instant('bridgePage.approveProgressMessage'),
          {
            label: this.translateService.instant('notifications.approveInProgress'),
            status: TuiNotification.Info,
            autoClose: false
          }
        );
      }
    };

    this.bridgeService
      .approve(bridgeTradeRequest)
      .pipe(first())
      .subscribe(
        async (_: TransactionReceipt) => {
          approveInProgressSubscription$.unsubscribe();
          this.notificationsService.show(
            this.translateService.instant('bridgePage.approveSuccessMessage'),
            {
              label: this.translateService.instant('notifications.successApprove'),
              status: TuiNotification.Success,
              autoClose: 15000
            }
          );

          await this.tokensService.calculateUserTokensBalances();

          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.cdr.detectChanges();
        },
        err => {
          approveInProgressSubscription$?.unsubscribe();
          this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
          this.errorsService.catch(err);
          this.cdr.detectChanges();
        }
      );
  }

  public async createTrade(): Promise<void> {
    this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
    this.cdr.detectChanges();
    const bridgeTradeRequest: BridgeTradeRequest = {
      toAddress: this.toWalletAddress,
      onTransactionHash: () => {
        this.notifyTradeInProgress();
      }
    };

    this.bridgeService
      .createTrade(bridgeTradeRequest)
      .pipe(first())
      .subscribe(
        async (_: TransactionReceipt) => {
          this.tradeInProgressSubscription$.unsubscribe();
          this.notificationsService.show(
            new PolymorpheusComponent(SuccessTrxNotificationComponent),
            {
              status: TuiNotification.Success,
              autoClose: 15000
            }
          );

          this.counterNotificationsService.updateUnread();
          await this.tokensService.calculateUserTokensBalances();

          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          await this.conditionalCalculate();
        },
        err => {
          this.tradeInProgressSubscription$?.unsubscribe();
          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.errorsService.catch(err);
          this.cdr.detectChanges();
        }
      );
  }

  private checkMinMaxAmounts(): void {
    const { fromAmount } = this.swapFormService.inputValue;

    const minAmount = this.getMinMaxAmounts('minAmount');
    const maxAmount = this.getMinMaxAmounts('maxAmount');
    this.maxError = fromAmount?.gt(maxAmount) ? maxAmount : false;
    this.minError = fromAmount?.lt(minAmount) ? minAmount : false;
    this.cdr.detectChanges();
  }

  private getMinMaxAmounts(amountType: 'minAmount' | 'maxAmount'): number {
    const { fromToken, fromBlockchain, toBlockchain } = this.swapFormService.inputValue;

    return this.bridgeTokenPairsByBlockchainsArray
      .find(
        tokenPairsByBlockchains =>
          tokenPairsByBlockchains.fromBlockchain === fromBlockchain &&
          tokenPairsByBlockchains.toBlockchain === toBlockchain
      )
      ?.tokenPairs.find(
        tokenPair =>
          tokenPair.tokenByBlockchain[fromBlockchain]?.address.toLowerCase() ===
          fromToken?.address.toLowerCase()
      )?.tokenByBlockchain[fromBlockchain][amountType];
  }

  public handleClick(clickType: 'swap' | 'approve') {
    const isPolygonEthBridge =
      this.fromBlockchain === BLOCKCHAIN_NAME.POLYGON &&
      this.toBlockchain === BLOCKCHAIN_NAME.ETHEREUM;
    if (isPolygonEthBridge && !this.iframeService.isIframe) {
      this.dialogService
        .open(new PolymorpheusComponent(ReceiveWarningModalComponent, this.injector), { size: 's' })
        .subscribe(allowAction => {
          if (allowAction) {
            this.doButtonAction(clickType);
          }
        });
    } else {
      this.doButtonAction(clickType);
    }
  }

  private doButtonAction(clickType: 'swap' | 'approve'): void {
    if (clickType === 'swap') {
      this.createTrade();
    } else {
      this.approveTrade();
    }
  }

  private notifyTradeInProgress() {
    this.tradeInProgressSubscription$ = this.notificationsService.show(
      this.translateService.instant('bridgePage.progressMessage'),
      {
        label: this.translateService.instant('notifications.tradeInProgress'),
        status: TuiNotification.Info,
        autoClose: false
      }
    );

    if (this.window.location.pathname === '/') {
      const isPolygonEthBridge =
        this.fromBlockchain === BLOCKCHAIN_NAME.POLYGON &&
        this.toBlockchain === BLOCKCHAIN_NAME.ETHEREUM;

      if (!isPolygonEthBridge) {
        this.successTxModalService.open();
        return;
      }

      if (!this.iframeService.isIframe) {
        this.dialogService
          .open(new PolymorpheusComponent(TrackTransactionModalComponent), {
            size: 's',
            data: { idPrefix: '' }
          })
          .subscribe();
      }
    }
  }
}
