import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Self
} from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import BigNumber from 'bignumber.js';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { WalletsModalService } from 'src/app/core/wallets/services/wallets-modal.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { startWith, takeUntil } from 'rxjs/operators';
import { HeaderStore } from 'src/app/core/header/services/header.store';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SwapButtonContainerErrorsService } from '@shared/components/buttons/swap-button-container/services/swap-button-container-errors.service';
import { ERROR_TYPE } from '@shared/components/buttons/swap-button-container/models/error-type';
import { BlockchainName } from '@shared/models/blockchain/blockchain-name';

@Component({
  selector: 'app-swap-button-container',
  templateUrl: './swap-button-container.component.html',
  styleUrls: ['./swap-button-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SwapButtonContainerComponent implements OnInit {
  @Input() needApprove = false;

  @Input() status: TRADE_STATUS;

  @Input() formService: SwapFormService;

  @Input() idPrefix = '';

  @Input() set minAmount(value: false | number | BigNumber) {
    this.swapButtonContainerErrorsService.setMinAmount(value);
  }

  @Input() set maxAmount(value: false | number | BigNumber) {
    this.swapButtonContainerErrorsService.setMaxAmount(value);
  }

  @Input() buttonText = 'Swap';

  @Output() approveClick = new EventEmitter<void>();

  @Output() swapClick = new EventEmitter<void>();

  @Output() updateRatesClick = new EventEmitter<void>();

  public TRADE_STATUS = TRADE_STATUS;

  public fromBlockchain: BlockchainName;

  public needLogin: boolean;

  public needLoginLoading: boolean;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  public tokensFilled: boolean;

  public readonly error$ = this.swapButtonContainerErrorsService.error$;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly walletsModalService: WalletsModalService,
    private readonly iframeService: IframeService,
    private readonly headerStore: HeaderStore,
    private readonly swapButtonContainerErrorsService: SwapButtonContainerErrorsService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    if (this.iframeService.isIframe) {
      this.needLoginLoading = false;
      this.needLogin = true;

      this.authService
        .getCurrentUser()
        .pipe(takeUntil(this.destroy$))
        .subscribe(user => {
          this.needLogin = !user?.address;
          this.cdr.markForCheck();
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
          this.cdr.markForCheck();
        });
    }

    this.formService.inputValueChanges
      .pipe(startWith(this.formService.inputValue), takeUntil(this.destroy$))
      .subscribe(form => {
        this.fromBlockchain = form.fromBlockchain;
        this.tokensFilled = Boolean(form.fromToken && form.toToken);
        this.cdr.markForCheck();
      });
  }

  public onLogin(): void {
    this.walletsModalService.open().subscribe();
  }

  public allowChangeNetwork(err: ERROR_TYPE): boolean {
    if (err !== ERROR_TYPE.WRONG_BLOCKCHAIN) {
      return false;
    }
    return this.walletConnectorService?.provider.walletName === WALLET_NAME.METAMASK;
  }

  public async changeNetwork(): Promise<void> {
    const currentStatus = this.status;
    this.status = TRADE_STATUS.LOADING;
    const { fromBlockchain } = this.formService.inputValue;
    try {
      await this.walletConnectorService.switchChain(fromBlockchain);
    } finally {
      this.status = currentStatus;
    }
  }

  public isMinMaxError(err: ERROR_TYPE): boolean {
    return err === ERROR_TYPE.LESS_THAN_MINIMUM || err === ERROR_TYPE.MORE_THAN_MAXIMUM;
  }
}
