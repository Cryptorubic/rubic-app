import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import BigNumber from 'bignumber.js';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SwapButtonContainerErrorsService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container-errors.service';
import { SwapButtonContainerService } from '@features/swaps/shared/components/swap-button-container/services/swap-button-container.service';
import { SwapButtonService } from '@features/swaps/shared/components/swap-button-container/services/swap-button.service';
import { IframeService } from '@core/services/iframe/iframe.service';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { map } from 'rxjs';

@Component({
  selector: 'app-swap-button-container',
  templateUrl: './swap-button-container.component.html',
  styleUrls: ['./swap-button-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapButtonContainerComponent {
  @Input() needApprove: boolean;

  @Input() withApproveButton = false;

  @Input() set status(value: TRADE_STATUS) {
    this.swapButtonContainerService.tradeStatus = value;
  }

  @Input() set idPrefix(value: string) {
    this.swapButtonContainerService.idPrefix = value || '';
  }

  get idPrefix(): string {
    return this.swapButtonContainerService.idPrefix;
  }

  @Input() set error(error: RubicError<ERROR_TYPE> | null) {
    this.swapButtonContainerErrorsService.setRubicError(error);
  }

  @Input() set minAmount(
    value: false | number | BigNumber | { amount: BigNumber; symbol: string }
  ) {
    this.swapButtonContainerErrorsService.setMinAmountError(value);
  }

  @Input() set maxAmount(
    value: false | number | BigNumber | { amount: BigNumber; symbol: string }
  ) {
    this.swapButtonContainerErrorsService.setMaxAmountError(value);
  }

  @Input() buttonText: string;

  @Input() isOnramper = false;

  /**
   * True, if user trades non-evm changenow and doesn't need to connect wallet.
   */
  @Input() nonEvmChangenow = false;

  @Output() readonly onApproveClick = new EventEmitter<void>();

  @Output() readonly onSwapClick = new EventEmitter<void>();

  @Output() readonly handleDirectBuy = new EventEmitter<void>();

  @Output() readonly onUpdateRateClick = new EventEmitter<void>();

  public readonly user$ = this.authService.currentUser$.pipe(map(user => user?.address));

  public readonly isUpdateRateStatus$ = this.swapButtonContainerService.isUpdateRateStatus$;

  public readonly error$ = this.swapButtonContainerErrorsService.error$;

  public readonly isIframe = this.iframeService.isIframe;

  constructor(
    private readonly swapButtonContainerService: SwapButtonContainerService,
    private readonly swapButtonContainerErrorsService: SwapButtonContainerErrorsService,
    private readonly swapButtonService: SwapButtonService,
    private readonly authService: AuthService,
    private readonly iframeService: IframeService
  ) {}
}
