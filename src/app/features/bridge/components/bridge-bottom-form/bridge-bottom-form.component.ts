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
import { catchError, first, map, startWith, switchMap } from 'rxjs/operators';
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
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { SwapFormInput } from 'src/app/features/swaps/models/SwapForm';
import { BlockchainsBridgeTokens } from 'src/app/features/bridge/models/BlockchainsBridgeTokens';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { NotificationsService } from 'src/app/core/services/notifications/notifications.service';
import { CounterNotificationsService } from 'src/app/core/services/counter-notifications/counter-notifications.service';
import { CrossChainRoutingService } from 'src/app/features/bridge/services/cross-chain-routing-service/cross-chain-routing.service';
import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { CrossChainRoutingTrade } from 'src/app/features/bridge/services/cross-chain-routing-service/models/CrossChainRoutingTrade';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ReceiveWarningModalComponent } from 'src/app/features/bridge/components/bridge-bottom-form/components/receive-warning-modal/receive-warning-modal';
import { TrackTransactionModalComponent } from 'src/app/features/bridge/components/bridge-bottom-form/components/track-transaction-modal/track-transaction-modal';
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
  @Input() loading: boolean;

  @Input() tokens: AvailableTokenAmount[];

  @Input() formService: FormService;

  public readonly TRADE_STATUS = TRADE_STATUS;

  public readonly BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  private readonly onCalculateBridge: Subject<void>;

  private readonly onCalculateRouting: Subject<void>;

  private bridgeTokensPairs: BlockchainsBridgeTokens[];

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

  private crossChainRoutingTrade: CrossChainRoutingTrade;

  public crossChainRoutingErrorText: string;

  private formSubscription$: Subscription;

  private settingsSubscription$: Subscription;

  private userSubscription$: Subscription;

  private bridgeTokensSubscription$: Subscription;

  private calculateBridgeSubscription$: Subscription;

  private calculateRoutingSubscription$: Subscription;

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
    @Inject(Injector) private readonly injector: Injector,
    private readonly translate: TranslateService,
    private readonly tokensService: TokensService,
    private readonly notificationsService: NotificationsService,
    private readonly crossChainRoutingService: CrossChainRoutingService,
    private readonly counterNotificationsService: CounterNotificationsService
  ) {
    this.isBridgeSupported = true;
    this.onCalculateBridge = new Subject<void>();
    this.onCalculateRouting = new Subject<void>();
  }

  ngOnInit() {
    this.setupBridgeCalculation();
    this.setupRoutingCalculation();
    this.tradeStatus = TRADE_STATUS.DISABLED;

    this.bridgeTokensSubscription$ = this.bridgeService.tokens.subscribe(tokens => {
      this.bridgeTokensPairs = tokens;
    });

    this.formSubscription$ = this.swapFormService.commonTrade.controls.input.valueChanges
      .pipe(startWith(this.swapFormService.inputValue))
      .subscribe(form => this.setFormValues(form));

    this.settingsSubscription$ = this.settingsService.bridgeValueChanges
      .pipe(startWith(this.settingsService.bridgeValue))
      .subscribe(settings => {
        this.tronAddress = settings.tronAddress;
        this.setToWalletAddress();
      });

    this.userSubscription$ = this.authService.getCurrentUser().subscribe(() => {
      this.setToWalletAddress();
    });
  }

  ngOnDestroy() {
    this.bridgeTokensSubscription$.unsubscribe();
    this.formSubscription$.unsubscribe();
    this.settingsSubscription$.unsubscribe();
    this.userSubscription$.unsubscribe();
  }

  private setFormValues(form: SwapFormInput): void {
    if (
      this.fromBlockchain === form.fromBlockchain &&
      this.toBlockchain === form.toBlockchain &&
      this.fromAmount &&
      this.fromAmount.eq(form.fromAmount) &&
      this.tokensService.isOnlyBalanceUpdated(this.fromToken, form.fromToken) &&
      this.tokensService.isOnlyBalanceUpdated(this.toToken, form.toToken)
    ) {
      return;
    }

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

  private isBridgeTrade(): Promise<boolean> {
    return this.bridgeService
      .getCurrentBridgeToken()
      .pipe(map(bridgeToken => !!bridgeToken))
      .toPromise();
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

    if (!this.bridgeService.isBridgeSupported()) {
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

    this.crossChainRoutingErrorText = '';

    if (await this.isBridgeTrade()) {
      this.checkMinMaxAmounts();
      this.onCalculateBridge.next();
    } else {
      this.maxError = false;
      this.minError = false;
      this.onCalculateRouting.next();
    }
  }

  private setupBridgeCalculation(): void {
    if (this.calculateBridgeSubscription$) {
      return;
    }

    this.calculateBridgeSubscription$ = this.onCalculateBridge
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

  private setupRoutingCalculation(): void {
    if (this.calculateRoutingSubscription$) {
      return;
    }

    this.calculateRoutingSubscription$ = this.onCalculateRouting
      .pipe(
        switchMap(() => {
          this.tradeStatus = TRADE_STATUS.LOADING;
          this.cdr.detectChanges();

          const { fromToken, toToken, fromAmount } = this.swapFormService.inputValue;

          const needApprove$ = this.authService.user?.address
            ? this.crossChainRoutingService.needApprove(fromToken)
            : of(false);

          return forkJoin([
            this.crossChainRoutingService.calculateTrade(fromToken, fromAmount, toToken),
            needApprove$
          ]).pipe(
            map(([trade, needApprove]) => {
              this.needApprove = needApprove;
              this.crossChainRoutingTrade = trade;

              const toAmount = trade.tokenOutAmount;
              this.swapFormService.output.patchValue({
                toAmount
              });

              if (!toAmount || toAmount.isNaN() || toAmount.eq(0) || !this.toWalletAddress) {
                this.tradeStatus = TRADE_STATUS.DISABLED;
              } else {
                this.tradeStatus = needApprove
                  ? TRADE_STATUS.READY_TO_APPROVE
                  : TRADE_STATUS.READY_TO_SWAP;
              }
              this.cdr.detectChanges();
            }),
            catchError((err: RubicError<ERROR_TYPE>) => {
              this.crossChainRoutingErrorText = err.translateKey || err.message;
              this.swapFormService.output.patchValue({
                toAmount: new BigNumber(NaN)
              });
              this.tradeStatus = TRADE_STATUS.DISABLED;
              this.cdr.detectChanges();

              return of(null);
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
          this.translate.instant('bridgePage.approveProgressMessage'),
          {
            label: this.translate.instant('notifications.approveInProgress'),
            status: TuiNotification.Info,
            autoClose: false
          }
        );
      }
    };

    let approveObservable;
    if (await this.isBridgeTrade()) {
      approveObservable = this.bridgeService.approve(bridgeTradeRequest);
    } else {
      approveObservable = this.crossChainRoutingService.approve(
        this.crossChainRoutingTrade.tokenIn,
        {
          onTransactionHash: bridgeTradeRequest.onTransactionHash
        }
      );
    }

    approveObservable.pipe(first()).subscribe(
      (_: TransactionReceipt) => {
        approveInProgressSubscription$.unsubscribe();
        this.notificationsService.show(this.translate.instant('bridgePage.approveSuccessMessage'), {
          label: this.translate.instant('notifications.successApprove'),
          status: TuiNotification.Success,
          autoClose: 15000
        });

        this.tokensService.calculateUserTokensBalances();

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

    let tradeInProgressSubscription$: Subscription;
    const bridgeTradeRequest: BridgeTradeRequest = {
      toAddress: this.toWalletAddress,
      onTransactionHash: () => {
        this.cdr.detectChanges();
        tradeInProgressSubscription$ = this.notificationsService.show(
          this.translate.instant('bridgePage.progressMessage'),
          {
            label: this.translate.instant('notifications.tradeInProgress'),
            status: TuiNotification.Info,
            autoClose: false
          }
        );
        this.dialogService
          .open(new PolymorpheusComponent(TrackTransactionModalComponent, this.injector), {
            size: 's'
          })
          .subscribe();
      }
    };

    let createTradeObservable;
    if (await this.isBridgeTrade()) {
      createTradeObservable = this.bridgeService.createTrade(bridgeTradeRequest);
    } else {
      createTradeObservable = this.crossChainRoutingService.createTrade(
        this.crossChainRoutingTrade,
        {
          onTransactionHash: bridgeTradeRequest.onTransactionHash
        }
      );
    }

    createTradeObservable.pipe(first()).subscribe(
      (_: TransactionReceipt) => {
        tradeInProgressSubscription$.unsubscribe();
        this.notificationsService.show(this.translate.instant('bridgePage.successMessage'), {
          label: this.translate.instant('notifications.successfulTradeTitle'),
          status: TuiNotification.Success,
          autoClose: 15000
        });

        this.counterNotificationsService.updateUnread();
        this.tokensService.calculateUserTokensBalances();

        this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
        this.conditionalCalculate();
      },
      err => {
        tradeInProgressSubscription$?.unsubscribe();
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

    return this.bridgeTokensPairs
      .find(
        bridgeTokensPair =>
          bridgeTokensPair.fromBlockchain === fromBlockchain &&
          bridgeTokensPair.toBlockchain === toBlockchain
      )
      ?.bridgeTokens.find(
        bridgeToken =>
          bridgeToken.blockchainToken[fromBlockchain]?.address.toLowerCase() ===
          fromToken?.address.toLowerCase()
      )?.blockchainToken[fromBlockchain][amountType];
  }

  public handleClick(clickType: 'swap' | 'approve') {
    const isPolygonEthBridge =
      this.fromBlockchain === BLOCKCHAIN_NAME.POLYGON &&
      this.toBlockchain === BLOCKCHAIN_NAME.ETHEREUM;
    if (isPolygonEthBridge) {
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
}
