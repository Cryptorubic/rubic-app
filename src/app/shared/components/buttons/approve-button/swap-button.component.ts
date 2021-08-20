import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import BigNumber from 'bignumber.js';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { ISwapFormInput } from 'src/app/shared/models/swaps/ISwapForm';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { TranslateService } from '@ngx-translate/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BridgeService } from 'src/app/features/bridge/services/bridge-service/bridge.service';
import { WALLET_NAME } from 'src/app/core/wallets/components/wallets-modal/models/providers';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { WalletsModalService } from 'src/app/core/wallets/services/wallets-modal.service';
import { TRADE_STATUS } from '../../../models/swaps/TRADE_STATUS';

enum ERROR_TYPE {
  INSUFFICIENT_FUNDS = 'Insufficient balance',
  WRONG_BLOCKCHAIN = 'Wrong user network',
  NOT_SUPPORTED_BRIDGE = 'Not supported bridge',
  TRON_WALLET_ADDRESS = 'TRON wallet address is not set',
  LESS_THAN_MINIMUM = 'Entered amount less than minimum',
  MORE_THAN_MAXIMUM = 'Entered amount more than maximum',
  NO_AMOUNT = 'From amount was not entered'
}

@Component({
  selector: 'app-swap-button',
  templateUrl: './swap-button.component.html',
  styleUrls: ['./swap-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapButtonComponent implements OnInit, OnDestroy {
  @Input() needApprove = false;

  @Input() status: TRADE_STATUS;

  @Input() formService: FormService;

  @Input() set fromAmount(value: BigNumber) {
    this._fromAmount = value;
    this.checkNoAmountError();
    this.checkInsufficientFundsError();
  }

  @Input() set minAmount(value: false | number) {
    if (value) {
      this.minAmountValue = value;
      this.errorType[ERROR_TYPE.LESS_THAN_MINIMUM] = true;
    } else {
      this.errorType[ERROR_TYPE.LESS_THAN_MINIMUM] = false;
    }
  }

  private minAmountValue: number;

  @Input() set maxAmount(value: false | number) {
    if (value) {
      this.maxAmountValue = value;
      this.errorType[ERROR_TYPE.MORE_THAN_MAXIMUM] = true;
    } else {
      this.errorType[ERROR_TYPE.MORE_THAN_MAXIMUM] = false;
    }
  }

  private maxAmountValue: number;

  @Input() set isBridgeNotSupported(value: boolean) {
    this.errorType[ERROR_TYPE.NOT_SUPPORTED_BRIDGE] = value || false;
  }

  @Input() set isTronAddressNotSet(value: boolean) {
    this.errorType[ERROR_TYPE.TRON_WALLET_ADDRESS] = value;
  }

  @Output() approveClick = new EventEmitter<void>();

  @Output() swapClick = new EventEmitter<void>();

  @Output() loginEvent = new EventEmitter<void>();

  public TRADE_STATUS = TRADE_STATUS;

  public ERROR_TYPE = ERROR_TYPE;

  public needLogin: boolean;

  public needLoginLoading: boolean;

  public dataLoading: boolean;

  public errorType: Record<ERROR_TYPE, boolean>;

  private isTestingMode: boolean;

  private fromBlockchain: BLOCKCHAIN_NAME;

  private fromToken: TokenAmount;

  private _fromAmount: BigNumber;

  private authServiceSubscription$: Subscription;

  private useTestingModeSubscription$: Subscription;

  private formServiceSubscription$: Subscription;

  private providerConnectorServiceSubscription$: Subscription;

  get hasError(): boolean {
    return !!Object.values(ERROR_TYPE).find(key => this.errorType[key]);
  }

  public tokensFilled: boolean;

  public get allowChangeNetwork(): boolean {
    const unsupportedItBlockchains = [BLOCKCHAIN_NAME.XDAI, BLOCKCHAIN_NAME.TRON];
    const form = this.formService.commonTrade.controls.input.value;
    if (
      this.providerConnectorService?.providerName !== WALLET_NAME.METAMASK ||
      !form.fromBlockchain
    ) {
      return false;
    }

    if (form.toBlockchain === form.fromBlockchain) {
      return !unsupportedItBlockchains.some(el => el === form.fromBlockchain);
    }
    return this.bridgeService.isBridgeSupported();
  }

  public get networkErrorText(): void {
    return this.translateService.instant('common.switchTo', {
      networkName: this.formService.commonTrade.controls.input.value.fromBlockchain
    });
  }

  get errorText(): Observable<string> {
    let translateParams: { key: string; interpolateParams?: unknown };
    const err = this.errorType;

    switch (true) {
      case err[ERROR_TYPE.NOT_SUPPORTED_BRIDGE]:
        translateParams = { key: 'errors.chooseSupportedBridge' };
        break;
      case err[ERROR_TYPE.NO_AMOUNT]:
        translateParams = { key: 'errors.noEnteredAmount' };
        break;
      case err[ERROR_TYPE.LESS_THAN_MINIMUM]:
        translateParams = {
          key: 'errors.minimumAmount',
          interpolateParams: { amount: this.minAmountValue, token: this.fromToken?.symbol }
        };
        break;
      case err[ERROR_TYPE.MORE_THAN_MAXIMUM]:
        translateParams = {
          key: 'errors.maximumAmount',
          interpolateParams: { amount: this.maxAmountValue, token: this.fromToken?.symbol }
        };
        break;
      case err[ERROR_TYPE.INSUFFICIENT_FUNDS]:
        translateParams = { key: 'errors.InsufficientBalance' };
        break;
      case err[ERROR_TYPE.TRON_WALLET_ADDRESS]:
        translateParams = { key: 'errors.setTronAddress' };
        break;
      case err[ERROR_TYPE.WRONG_BLOCKCHAIN]:
        translateParams = {
          key: 'errors.chooseNetworkWallet',
          interpolateParams: { blockchain: this.fromToken?.blockchain || '' }
        };
        break;
      default:
        translateParams = {
          key: 'Unknown Error',
          interpolateParams: {}
        };
        break;
    }

    return this.translateService.stream(translateParams.key, translateParams.interpolateParams);
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly useTestingModeService: UseTestingModeService,
    private readonly walletsModalService: WalletsModalService,
    private translateService: TranslateService,
    private readonly bridgeService: BridgeService,
    private readonly web3PublicService: Web3PublicService,
    private readonly iframeService: IframeService
  ) {
    this.errorType = Object.values(ERROR_TYPE).reduce(
      (acc, key) => ({
        ...acc,
        [key]: false
      }),
      {}
    ) as Record<ERROR_TYPE, boolean>;
  }

  ngOnInit(): void {
    if (this.iframeService.isIframe) {
      this.needLoginLoading = false;
      this.needLogin = true;
      this.authServiceSubscription$ = this.authService.getCurrentUser().subscribe(user => {
        this.needLogin = !user?.address;
        this.cdr.detectChanges();
      });
    } else {
      this.needLoginLoading = true;
      this.needLogin = true;
      this.authServiceSubscription$ = this.authService.getCurrentUser().subscribe(user => {
        if (user !== undefined) {
          this.needLoginLoading = false;
          this.needLogin = !user?.address;
        }
        this.cdr.detectChanges();
      });
    }

    this.useTestingModeSubscription$ = this.useTestingModeService.isTestingMode.subscribe(
      isTestingMode => {
        this.isTestingMode = isTestingMode;
        if (isTestingMode) {
          this.checkErrors();
        }
      }
    );

    this.setFormValues(this.formService.commonTrade.controls.input.value);
    this.formServiceSubscription$ =
      this.formService.commonTrade.controls.input.valueChanges.subscribe(form => {
        this.setFormValues(form);
      });

    this.providerConnectorServiceSubscription$ =
      this.providerConnectorService.$networkChange.subscribe(() => {
        this.checkWrongBlockchainError();
      });
  }

  ngOnDestroy(): void {
    this.authServiceSubscription$.unsubscribe();
    this.useTestingModeSubscription$?.unsubscribe();
    this.formServiceSubscription$?.unsubscribe();
    this.providerConnectorServiceSubscription$?.unsubscribe();
  }

  private setFormValues(form: ISwapFormInput): void {
    this.dataLoading = true;
    this.cdr.detectChanges();

    this.fromBlockchain = form.fromBlockchain;
    this.tokensFilled = Boolean(form.fromToken && form.toToken);
    this.fromToken = form.fromToken;
    this.checkErrors().then(() => {
      this.dataLoading = false;
      this.cdr.detectChanges();
    });
  }

  private async checkErrors(): Promise<void> {
    await this.checkInsufficientFundsError();
    this.checkWrongBlockchainError();
    this.checkNoAmountError();
  }

  private async checkInsufficientFundsError(): Promise<void> {
    if (!this._fromAmount || !this.fromToken || !this.authService.user?.address) {
      this.errorType[ERROR_TYPE.INSUFFICIENT_FUNDS] = false;
      this.cdr.detectChanges();
      return;
    }

    let balance = this.fromToken.amount;
    if (!this.fromToken.amount.isFinite()) {
      balance = (
        await (<Web3Public>(
          this.web3PublicService[this.fromToken.blockchain]
        )).getTokenOrNativeBalance(this.authService.user.address, this.fromToken.address)
      ).div(10 ** this.fromToken.decimals);
    }

    this.errorType[ERROR_TYPE.INSUFFICIENT_FUNDS] = balance.lt(this._fromAmount);
    this.cdr.detectChanges();
  }

  private checkWrongBlockchainError(): void {
    if (this.providerConnectorService.provider) {
      const userBlockchain = this.providerConnectorService.network?.name;
      this.errorType[ERROR_TYPE.WRONG_BLOCKCHAIN] =
        this.fromBlockchain !== userBlockchain &&
        (!this.isTestingMode || `${this.fromBlockchain}_TESTNET` !== userBlockchain);

      this.cdr.detectChanges();
    }
  }

  public onLogin() {
    this.walletsModalService.open().subscribe(() => this.loginEvent.emit());
  }

  public async changeNetwork(): Promise<void> {
    const currentStatus = this.status;
    this.status = TRADE_STATUS.LOADING;
    try {
      await this.providerConnectorService.switchChain(this.fromBlockchain);
    } finally {
      this.status = currentStatus;
    }
  }

  private checkNoAmountError(): void {
    this.errorType[ERROR_TYPE.NO_AMOUNT] = !this._fromAmount || this._fromAmount.eq(0);
  }
}
