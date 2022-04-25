import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import BigNumber from 'bignumber.js';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SwapButtonContainerErrorsService } from '@features/swap-button-container/services/swap-button-container-errors.service';
import { SwapButtonContainerService } from '@features/swap-button-container/services/swap-button-container.service';
import { SwapButtonService } from '@features/swap-button-container/services/swap-button.service';

@Component({
  selector: 'app-swap-button-container',
  templateUrl: './swap-button-container.component.html',
  styleUrls: ['./swap-button-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapButtonContainerComponent {
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

  @Input() set minAmount(value: false | number | BigNumber) {
    this.swapButtonContainerErrorsService.setMinAmountError(value);
  }

  @Input() set maxAmount(value: false | number | BigNumber) {
    this.swapButtonContainerErrorsService.setMaxAmountError(value);
  }

  @Input() set buttonText(value: string) {
    this.swapButtonService.defaultButtonText = value;
  }

  @Output() readonly onApproveClick = new EventEmitter<void>();

  @Output() readonly onSwapClick = new EventEmitter<void>();

  @Output() readonly onUpdateRateClick = new EventEmitter<void>();

  public readonly user$ = this.authService.getCurrentUser();

  public readonly isUpdateRateStatus$ = this.swapButtonContainerService.isUpdateRateStatus$;

  public readonly error$ = this.swapButtonContainerErrorsService.error$;

  constructor(
    private readonly swapButtonContainerService: SwapButtonContainerService,
    private readonly swapButtonContainerErrorsService: SwapButtonContainerErrorsService,
    private readonly swapButtonService: SwapButtonService,
    private readonly authService: AuthService
  ) {}
}
