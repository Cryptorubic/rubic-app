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
import { TuiDialogService, TuiNotification, TuiNotificationsService } from '@taiga-ui/core';
import { first, map, startWith, switchMap } from 'rxjs/operators';
import { TransactionReceipt } from 'web3-eth';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TRADE_STATUS } from 'src/app/shared/models/swaps/TRADE_STATUS';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SettingsService } from 'src/app/features/swaps/services/settings-service/settings.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { UndefinedError } from 'src/app/core/errors/models/undefined.error';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { SwapFormInput } from 'src/app/features/swaps/models/SwapForm';
import { BlockchainsBridgeTokens } from 'src/app/features/bridge/models/BlockchainsBridgeTokens';
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

  public minError: false | number;

  public maxError: false | number;

  public TRADE_STATUS = TRADE_STATUS;

  public BLOCKCHAIN_NAME = BLOCKCHAIN_NAME;

  private formSubscription$: Subscription;

  private settingsSubscription$: Subscription;

  private userSubscription$: Subscription;

  private unsupportedBridgeSubscription$: Subscription;

  private bridgeTokensSubscription$: Subscription;

  private calculateTradeSubscription$: Subscription;

  private fromBlockchain: BLOCKCHAIN_NAME;

  public toBlockchain: BLOCKCHAIN_NAME;

  public needApprove: boolean;

  public fromAmount: BigNumber;

  public minmaxError = false;

  public tradeStatus: TRADE_STATUS;

  public isBridgeSupported;

  public toWalletAddress: string;

  public tronAddress: string;

  private readonly onCalculateTrade: Subject<void>;

  private bridgeTokensPairs: BlockchainsBridgeTokens[];

  public get allowTrade(): boolean {
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

  public get whatIsBlockchain(): BlockchainInfo {
    const { fromBlockchain, toBlockchain } = this.swapFormService.commonTrade.controls.input.value;
    const nonEthBlockchain =
      toBlockchain === BLOCKCHAIN_NAME.ETHEREUM ? fromBlockchain : toBlockchain;
    return BLOCKCHAINS_INFO[nonEthBlockchain];
  }

  public get tokenInfoUrl(): string {
    const { fromToken, toToken } = this.swapFormService.commonTrade.controls.input.value;
    let tokenAddress;
    if (
      toToken?.address &&
      toToken.address !== NATIVE_TOKEN_ADDRESS &&
      this.web3PublicService[BLOCKCHAIN_NAME.ETHEREUM].isAddressCorrect(toToken.address)
    ) {
      tokenAddress = toToken?.address;
    } else {
      tokenAddress = fromToken?.address;
    }
    return tokenAddress ? `t/${tokenAddress}` : '';
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
    private readonly notificationsService: TuiNotificationsService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly translate: TranslateService,
    private readonly tokensService: TokensService
  ) {
    this.isBridgeSupported = true;
    this.onCalculateTrade = new Subject<void>();
  }

  ngOnInit() {
    this.setupCalculating();
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

    this.userSubscription$ = this.authService.getCurrentUser().subscribe(user => {
      this.setToWalletAddress();
      if (user?.address) {
        this.conditionalCalculate();
      }
    });
  }

  ngOnDestroy() {
    this.bridgeTokensSubscription$.unsubscribe();
    this.formSubscription$.unsubscribe();
    this.settingsSubscription$.unsubscribe();
    this.userSubscription$.unsubscribe();
    this.unsupportedBridgeSubscription$?.unsubscribe();
  }

  private setFormValues(form: SwapFormInput): void {
    this.fromBlockchain = form.fromBlockchain;
    this.toBlockchain = form.toBlockchain;
    this.fromAmount = form.fromAmount;

    this.setToWalletAddress();
    this.checkMinMaxAmounts();

    this.conditionalCalculate();
  }

  private setToWalletAddress(): void {
    if (this.toBlockchain === BLOCKCHAIN_NAME.TRON) {
      this.toWalletAddress = this.tronAddress;
    } else {
      this.toWalletAddress = this.authService.user?.address;
    }
    this.cdr.detectChanges();
  }

  private conditionalCalculate(): void {
    const { fromBlockchain, toBlockchain } = this.swapFormService.inputValue;

    if (fromBlockchain === toBlockchain) {
      return;
    }

    if (!this.bridgeService.isBridgeSupported()) {
      this.tradeStatus = TRADE_STATUS.DISABLED;

      if (this.isBridgeSupported) {
        this.isBridgeSupported = false;
        this.unsupportedBridgeSubscription$ = this.notificationsService
          .show(this.translate.instant('errors.notSupportedBridge'), {
            label: this.translate.instant('common.error'),
            status: TuiNotification.Error,
            autoClose: false
          })
          .subscribe();
      }

      this.cdr.detectChanges();
      return;
    }

    this.isBridgeSupported = true;
    this.unsupportedBridgeSubscription$?.unsubscribe();
    this.cdr.detectChanges();

    if (!this.allowTrade) {
      this.tradeStatus = TRADE_STATUS.DISABLED;
      this.swapFormService.output.patchValue({
        toAmount: new BigNumber(NaN)
      });
      this.cdr.detectChanges();
      return;
    }

    this.onCalculateTrade.next();
  }

  private setupCalculating(): void {
    if (this.calculateTradeSubscription$) {
      return;
    }

    this.calculateTradeSubscription$ = this.onCalculateTrade
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
                this.errorsService.catch$(new UndefinedError());
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

  public approveTrade() {
    this.tradeStatus = TRADE_STATUS.APPROVE_IN_PROGRESS;
    this.cdr.detectChanges();

    let approveInProgressSubscription$: Subscription;
    const bridgeTradeRequest: BridgeTradeRequest = {
      onTransactionHash: () => {
        this.cdr.detectChanges();
        approveInProgressSubscription$ = this.notificationsService
          .show(this.translate.instant('bridgePage.approveProgressMessage'), {
            label: this.translate.instant('notifications.approveInProgress'),
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
        (_: TransactionReceipt) => {
          approveInProgressSubscription$.unsubscribe();
          this.notificationsService
            .show(this.translate.instant('bridgePage.approveSuccessMessage'), {
              label: this.translate.instant('notifications.successApprove'),
              status: TuiNotification.Success,
              autoClose: 15000
            })
            .subscribe();

          this.tokensService.recalculateUsersBalance();

          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.cdr.detectChanges();
        },
        err => {
          approveInProgressSubscription$?.unsubscribe();
          this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
          this.errorsService.catch$(err);
          this.cdr.detectChanges();
        }
      );
  }

  public createTrade() {
    this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
    this.cdr.detectChanges();

    let tradeInProgressSubscription$: Subscription;
    const bridgeTradeRequest: BridgeTradeRequest = {
      toAddress: this.toWalletAddress,
      onTransactionHash: () => {
        this.cdr.detectChanges();
        tradeInProgressSubscription$ = this.notificationsService
          .show(this.translate.instant('bridgePage.progressMessage'), {
            label: this.translate.instant('notifications.tradeInProgress'),
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
        (_: TransactionReceipt) => {
          tradeInProgressSubscription$.unsubscribe();
          this.notificationsService
            .show(this.translate.instant('bridgePage.successMessage'), {
              label: this.translate.instant('notifications.successfulTradeTitle'),
              status: TuiNotification.Success,
              autoClose: 15000
            })
            .subscribe();

          this.tokensService.recalculateUsersBalance();

          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.conditionalCalculate();
        },
        err => {
          tradeInProgressSubscription$?.unsubscribe();
          this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          this.errorsService.catch$(err);
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
}
