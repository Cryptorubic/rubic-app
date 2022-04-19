import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import BigNumber from 'bignumber.js';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { map, startWith } from 'rxjs/operators';
import { HeaderStore } from '@core/header/services/header.store';
import { SwapFormService } from '@features/swaps/services/swaps-form-service/swap-form.service';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SwapButtonContainerErrorsService } from '@features/swap-button-container/services/swap-button-container-errors.service';
import { ERROR_TYPE } from '@features/swap-button-container/models/error-type';
import { SwapButtonContainerService } from '@features/swap-button-container/services/swap-button-container.service';
import { SwapButtonService } from '@features/swap-button-container/services/swap-button.service';

@Component({
  selector: 'app-swap-button-container',
  templateUrl: './swap-button-container.component.html',
  styleUrls: ['./swap-button-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapButtonContainerComponent {
  @Input() needApprove = false;

  @Input() set status(value: TRADE_STATUS) {
    this._status = value;
    this.swapButtonContainerService.tradeStatus = value;
  }

  get status(): TRADE_STATUS {
    return this._status;
  }

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

  @Output() onApproveClick = new EventEmitter<void>();

  @Output() onSwapClick = new EventEmitter<void>();

  @Output() onUpdateRateClick = new EventEmitter<void>();

  public TRADE_STATUS = TRADE_STATUS;

  private _status: TRADE_STATUS;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  public readonly user$ = this.authService.getCurrentUser();

  public readonly isUpdateRateStatus$ = this.swapButtonContainerService.isUpdateRateStatus$;

  public readonly error$ = this.swapButtonContainerErrorsService.error$;

  public readonly fromBlockchain$ = this.swapFormService.inputValueChanges.pipe(
    startWith(this.swapFormService.inputValue),
    map(form => form.fromBlockchain)
  );

  constructor(
    private readonly swapButtonContainerService: SwapButtonContainerService,
    private readonly swapButtonContainerErrorsService: SwapButtonContainerErrorsService,
    private readonly swapButtonService: SwapButtonService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly headerStore: HeaderStore,
    private readonly swapFormService: SwapFormService
  ) {}

  public allowChangeNetwork(err: ERROR_TYPE): boolean {
    if (err !== ERROR_TYPE.WRONG_BLOCKCHAIN) {
      return false;
    }
    return this.walletConnectorService?.provider.walletName === WALLET_NAME.METAMASK;
  }

  public async changeNetwork(): Promise<void> {
    const currentStatus = this.status;
    this.status = TRADE_STATUS.LOADING;

    const { fromBlockchain } = this.swapFormService.inputValue;
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
