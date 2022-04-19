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
import { AuthService } from '@core/services/auth/auth.service';
import BigNumber from 'bignumber.js';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { startWith, takeUntil } from 'rxjs/operators';
import { HeaderStore } from '@core/header/services/header.store';
import { SwapFormService } from '@features/swaps/services/swaps-form-service/swap-form.service';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SwapButtonContainerErrorsService } from '@features/swap-button-container/services/swap-button-container-errors.service';
import { ERROR_TYPE } from '@features/swap-button-container/models/error-type';
import { BlockchainName } from '@shared/models/blockchain/blockchain-name';
import { SwapButtonContainerService } from '@features/swap-button-container/services/swap-button-container.service';
import { SwapButtonService } from '@features/swap-button-container/services/swap-button.service';

@Component({
  selector: 'app-swap-button-container',
  templateUrl: './swap-button-container.component.html',
  styleUrls: ['./swap-button-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class SwapButtonContainerComponent implements OnInit {
  @Input() needApprove = false;

  @Input() set status(value: TRADE_STATUS) {
    this._status = value;
    this.swapButtonContainerService.tradeStatus = value;
  }

  get status(): TRADE_STATUS {
    return this._status;
  }

  @Input() formService: SwapFormService;

  @Input() set idPrefix(value: string) {
    this.swapButtonContainerService.idPrefix = value || '';
  }

  get idPrefix(): string {
    return this.swapButtonContainerService.idPrefix;
  }

  @Input() set minAmount(value: false | number | BigNumber) {
    this.swapButtonContainerErrorsService.setMinAmount(value);
  }

  @Input() set maxAmount(value: false | number | BigNumber) {
    this.swapButtonContainerErrorsService.setMaxAmount(value);
  }

  @Input() set buttonText(value: string) {
    this.swapButtonService.buttonText = value;
  }

  @Output() approveClick = new EventEmitter<void>();

  @Output() swapClick = new EventEmitter<void>();

  @Output() onUpdateRateClick = new EventEmitter<void>();

  public TRADE_STATUS = TRADE_STATUS;

  private _status: TRADE_STATUS;

  public fromBlockchain: BlockchainName;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  public readonly user$ = this.authService.getCurrentUser();

  public readonly isUpdateRateStatus$ = this.swapButtonContainerService.isUpdateRateStatus$;

  public readonly error$ = this.swapButtonContainerErrorsService.error$;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapButtonContainerService: SwapButtonContainerService,
    private readonly swapButtonContainerErrorsService: SwapButtonContainerErrorsService,
    private readonly swapButtonService: SwapButtonService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly headerStore: HeaderStore,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    this.formService.inputValueChanges
      .pipe(startWith(this.formService.inputValue), takeUntil(this.destroy$))
      .subscribe(form => {
        this.fromBlockchain = form.fromBlockchain;
        this.cdr.markForCheck();
      });
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
