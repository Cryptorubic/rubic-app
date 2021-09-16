import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import BigNumber from 'bignumber.js';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { ISwapFormInput, ISwapFormOutput } from 'src/app/shared/models/swaps/ISwapForm';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { TranslateService } from '@ngx-translate/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BridgeService } from 'src/app/features/bridge/services/bridge-service/bridge.service';
import { WALLET_NAME } from 'src/app/core/wallets/components/wallets-modal/models/providers';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { WithRoundPipe } from 'src/app/shared/pipes/with-round.pipe';
import { BIG_NUMBER_FORMAT } from 'src/app/shared/constants/formats/BIG_NUMBER_FORMAT';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { WalletsModalService } from 'src/app/core/wallets/services/wallets-modal.service';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { startWith, takeUntil } from 'rxjs/operators';
import { InstantTradeService } from 'src/app/features/instant-trade/services/instant-trade-service/instant-trade.service';
import { CryptoTapFormOutput } from 'src/app/features/crypto-tap/models/CryptoTapForm';
import { SwapFormInput } from 'src/app/features/swaps/models/SwapForm';
import { TRADE_STATUS } from '../../../models/swaps/TRADE_STATUS';

enum ERROR_TYPE {
  INSUFFICIENT_FUNDS = 'Insufficient balance',
  WRONG_BLOCKCHAIN = 'Wrong user network',
  NOT_SUPPORTED_BRIDGE = 'Not supported bridge',
  TRON_WALLET_ADDRESS = 'TRON wallet address is not set',
  LESS_THAN_MINIMUM = 'Entered amount less than minimum',
  MORE_THAN_MAXIMUM = 'Entered amount more than maximum',
  MULTICHAIN_WALLET = 'Multichain wallets are not supported',
  NO_AMOUNT = 'From amount was not entered'
}

enum PRICE_IMPACT {
  LOW = 4.7,
  HIGH = 15.01
}

@Component({
  selector: 'app-swap-button',
  templateUrl: './swap-button.component.html',
  styleUrls: ['./swap-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SwapButtonComponent implements OnInit {
  @Input() needApprove = false;

  @Input() status: TRADE_STATUS;

  @Input() formService: FormService;

  @Input() idPrefix: string = '';

  @Input() set fromAmount(value: BigNumber) {
    this._fromAmount = value;
    this.checkInsufficientFundsError();
  }

  @Input() set minAmount(value: false | number | BigNumber) {
    if (value) {
      if (typeof value === 'number') {
        this.minAmountValue = value.toString();
      } else {
        this.minAmountValue = this.withRoundPipe.transform(
          value.toFormat(BIG_NUMBER_FORMAT),
          'toClosestValue'
        );
      }
      this.errorType[ERROR_TYPE.LESS_THAN_MINIMUM] = true;
    } else {
      this.errorType[ERROR_TYPE.LESS_THAN_MINIMUM] = false;
    }
  }

  private minAmountValue: string;

  @Input() set maxAmount(value: false | number | BigNumber) {
    if (value) {
      if (typeof value === 'number') {
        this.maxAmountValue = value.toString();
      } else {
        this.maxAmountValue = this.withRoundPipe.transform(
          value.toFormat(BIG_NUMBER_FORMAT),
          'toClosestValue'
        );
      }
      this.errorType[ERROR_TYPE.MORE_THAN_MAXIMUM] = true;
    } else {
      this.errorType[ERROR_TYPE.MORE_THAN_MAXIMUM] = false;
    }
  }

  private maxAmountValue: string;

  @Input() set isBridgeNotSupported(value: boolean) {
    this.errorType[ERROR_TYPE.NOT_SUPPORTED_BRIDGE] = value;
  }

  @Input() set isTronAddressNotSet(value: boolean) {
    this.errorType[ERROR_TYPE.TRON_WALLET_ADDRESS] = value;
  }

  @Input() swapButtonText? = 'Swap';

  @Output() approveClick = new EventEmitter<void>();

  @Output() swapClick = new EventEmitter<void>();

  @Output() updateRatesClick = new EventEmitter<void>();

  @Output() loginEvent = new EventEmitter<void>();

  public TRADE_STATUS = TRADE_STATUS;

  public ERROR_TYPE = ERROR_TYPE;

  public PRICE_IMPACT = PRICE_IMPACT;

  public needLogin: boolean;

  public needLoginLoading: boolean;

  public dataLoading: boolean;

  public errorType: Record<ERROR_TYPE, boolean>;

  private isTestingMode: boolean;

  private _fromAmount: BigNumber;

  public tokensFilled: boolean;

  public priceImpact: number;

  get hasError(): boolean {
    return !!Object.values(ERROR_TYPE).find(key => this.errorType[key]);
  }

  get allowChangeNetwork(): boolean {
    const form = this.formService.inputValue;
    if (
      this.providerConnectorService?.providerName !== WALLET_NAME.METAMASK ||
      !form.fromBlockchain
    ) {
      return false;
    }

    if (form.toBlockchain === form.fromBlockchain) {
      return InstantTradeService.isSupportedBlockchain(form.fromBlockchain);
    }
    return true;
  }

  get networkErrorText(): void {
    return this.translateService.instant('common.switchTo', {
      networkName: this.formService.inputValue.fromBlockchain
    });
  }

  get errorText(): Observable<string> {
    let translateParams: { key: string; interpolateParams?: object };
    const err = this.errorType;
    const { fromToken, fromBlockchain } = this.formService.inputValue;

    switch (true) {
      case err[ERROR_TYPE.NOT_SUPPORTED_BRIDGE]:
        translateParams = { key: 'errors.chooseSupportedBridge' };
        break;
      case err[ERROR_TYPE.LESS_THAN_MINIMUM]:
        translateParams = {
          key: 'errors.minimumAmount',
          interpolateParams: { amount: this.minAmountValue, token: fromToken?.symbol }
        };
        break;
      case err[ERROR_TYPE.MORE_THAN_MAXIMUM]:
        translateParams = {
          key: 'errors.maximumAmount',
          interpolateParams: { amount: this.maxAmountValue, token: fromToken?.symbol }
        };
        break;
      case err[ERROR_TYPE.INSUFFICIENT_FUNDS]:
        translateParams = { key: 'errors.InsufficientBalance' };
        break;
      case err[ERROR_TYPE.TRON_WALLET_ADDRESS]:
        translateParams = { key: 'errors.setTronAddress' };
        break;
      case err[ERROR_TYPE.MULTICHAIN_WALLET]: {
        translateParams = { key: 'errors.multichainWallet' };
        break;
      }
      case err[ERROR_TYPE.WRONG_BLOCKCHAIN]: {
        translateParams = {
          key: 'errors.chooseNetworkWallet',
          interpolateParams: { blockchain: fromBlockchain || fromToken?.blockchain }
        };
        break;
      }
      default:
        translateParams = {
          key: 'Unknown Error',
          interpolateParams: {}
        };
        break;
    }

    return this.translateService.stream(translateParams.key, translateParams.interpolateParams);
  }

  private static isSwapForm(inputForm: ISwapFormInput): inputForm is SwapFormInput {
    return 'fromAmount' in inputForm;
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly useTestingModeService: UseTestingModeService,
    private readonly walletsModalService: WalletsModalService,
    private readonly translateService: TranslateService,
    private readonly bridgeService: BridgeService,
    private readonly web3PublicService: Web3PublicService,
    private readonly withRoundPipe: WithRoundPipe,
    private readonly iframeService: IframeService,
    private readonly destroy$: TuiDestroyService
  ) {
    this.errorType = Object.values(ERROR_TYPE).reduce(
      (acc, key) => ({
        ...acc,
        [key]: false
      }),
      {}
    ) as Record<ERROR_TYPE, boolean>;
    this.priceImpact = 0;
  }

  ngOnInit(): void {
    if (this.iframeService.isIframe) {
      this.needLoginLoading = false;
      this.needLogin = true;
      this.authService
        .getCurrentUser()
        .pipe(takeUntil(this.destroy$))
        .subscribe(user => {
          this.needLogin = !user?.address;
          this.cdr.detectChanges();
        });
    } else {
      this.needLoginLoading = true;
      this.needLogin = true;
      this.authService
        .getCurrentUser()
        .pipe(takeUntil(this.destroy$))
        .subscribe(user => {
          if (user !== undefined) {
            this.needLoginLoading = false;
            this.needLogin = !user?.address;
          }
          this.cdr.detectChanges();
        });
    }

    this.useTestingModeService.isTestingMode
      .pipe(takeUntil(this.destroy$))
      .subscribe(isTestingMode => {
        this.isTestingMode = isTestingMode;
        if (isTestingMode) {
          this.checkErrors();
        }
      });

    this.formService.inputValueChanges
      .pipe(startWith(this.formService.inputValue), takeUntil(this.destroy$))
      .subscribe(form => {
        this.setFormValues(form);
      });

    this.providerConnectorService.$networkChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.checkWrongBlockchainError();
    });

    combineLatest([
      this.formService.inputValueChanges.pipe(startWith(this.formService.inputValue)),
      this.formService.outputValueChanges.pipe(startWith(this.formService.outputValue))
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([inputForm, outputForm]) => {
        this.setPriceImpact(inputForm, outputForm);
      });
  }

  private setFormValues(form: ISwapFormInput): void {
    this.dataLoading = true;
    this.priceImpact = 0;
    this.cdr.detectChanges();

    this.tokensFilled = Boolean(form.fromToken && form.toToken);
    this.checkErrors().then(() => {
      this.dataLoading = false;
      this.cdr.detectChanges();
    });
  }

  private async checkErrors(): Promise<void> {
    await this.checkInsufficientFundsError();
    this.checkWrongBlockchainError();
  }

  private async checkInsufficientFundsError(): Promise<void> {
    const { fromToken } = this.formService.inputValue;
    if (!this._fromAmount || !fromToken || !this.authService.userAddress) {
      this.errorType[ERROR_TYPE.INSUFFICIENT_FUNDS] = false;
      this.cdr.detectChanges();
      return;
    }

    let balance = fromToken.amount;
    if (!fromToken.amount.isFinite()) {
      balance = Web3Public.fromWei(
        await this.web3PublicService[fromToken.blockchain].getTokenOrNativeBalance(
          this.authService.user.address,
          fromToken.address
        ),
        fromToken.decimals
      );
    }

    this.errorType[ERROR_TYPE.INSUFFICIENT_FUNDS] = balance.lt(this._fromAmount);
    this.cdr.detectChanges();
  }

  private checkWrongBlockchainError(): void {
    if (this.providerConnectorService.provider) {
      const userBlockchain = this.providerConnectorService.network?.name;
      const { fromBlockchain } = this.formService.inputValue;

      const { isMultiChainWallet } = this.providerConnectorService.provider;
      this.errorType[ERROR_TYPE.MULTICHAIN_WALLET] =
        isMultiChainWallet && fromBlockchain !== BLOCKCHAIN_NAME.ETHEREUM;

      this.errorType[ERROR_TYPE.WRONG_BLOCKCHAIN] =
        fromBlockchain !== userBlockchain &&
        !isMultiChainWallet &&
        (!this.isTestingMode || `${fromBlockchain}_TESTNET` !== userBlockchain);

      this.cdr.detectChanges();
    }
  }

  private setPriceImpact(inputForm: ISwapFormInput, outputForm: ISwapFormOutput) {
    const { fromToken, toToken } = inputForm;
    if (!fromToken?.price || !toToken?.price) {
      return;
    }

    let fromAmount: BigNumber;
    if (SwapButtonComponent.isSwapForm(inputForm)) {
      fromAmount = inputForm.fromAmount;
    } else {
      fromAmount = (outputForm as CryptoTapFormOutput).fromAmount;
    }
    const { toAmount } = outputForm;
    if (!fromAmount || !toAmount) {
      return;
    }

    const fromTokenCost = fromAmount.multipliedBy(fromToken.price);
    const toTokenCost = toAmount.multipliedBy(toToken.price);
    this.priceImpact = fromTokenCost
      .minus(toTokenCost)
      .dividedBy(fromTokenCost)
      .multipliedBy(100)
      .dp(2, BigNumber.ROUND_HALF_UP)
      .toNumber();
    this.cdr.detectChanges();
  }

  public onLogin() {
    this.walletsModalService.open().subscribe(() => this.loginEvent.emit());
  }

  public async changeNetwork(): Promise<void> {
    const currentStatus = this.status;
    this.status = TRADE_STATUS.LOADING;
    const { fromBlockchain } = this.formService.inputValue;
    try {
      await this.providerConnectorService.switchChain(fromBlockchain);
    } finally {
      this.status = currentStatus;
    }
  }
}
