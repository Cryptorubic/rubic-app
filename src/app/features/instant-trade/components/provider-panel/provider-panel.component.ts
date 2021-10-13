import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { INSTANT_TRADES_STATUS } from 'src/app/features/instant-trade/models/instant-trades-trade-status';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { ProviderControllerData } from 'src/app/shared/models/instant-trade/providers-controller-data';
import { TradeData } from 'src/app/features/instant-trade/components/provider-panel/models/trade-data';
import { ProviderData } from 'src/app/features/instant-trade/components/provider-panel/models/provider-data';
import { RubicError } from 'src/app/core/errors/models/RubicError';

@Component({
  selector: 'app-provider-panel',
  templateUrl: './provider-panel.component.html',
  styleUrls: ['./provider-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProviderPanelComponent {
  @Input() public providerIndex: number;

  /**
   * Setup provider data.
   * @param data provider controller data.
   */
  @Input() public set providerControllerData(data: ProviderControllerData) {
    this.calculateProviderState(data);
  }

  /**
   * Provider selection event.
   */
  @Output() public selectProvider: EventEmitter<void>;

  /**
   * Trade data.
   */
  public tradeData: TradeData;

  /**
   * Provider data.
   */
  public providerData: ProviderData;

  /**
   * Error translate key.
   */
  public errorTranslateKey: string;

  constructor() {
    this.selectProvider = new EventEmitter<void>();
  }

  /**
   * Emit provider selection event to parent component.
   */
  public activateProvider(): void {
    if (!this.providerData.loading) {
      this.selectProvider.emit();
    }
  }

  /**
   * @desc Calculate provider state based on controller status.
   * @param data Provider controller data.
   */
  private calculateProviderState(data: ProviderControllerData): void {
    const hasError = data.tradeState === INSTANT_TRADES_STATUS.ERROR;
    this.providerData = {
      name: data.tradeProviderInfo.label,
      isBestRate: data.isBestRate,
      isActive: data.isSelected,
      hasError,
      loading: this.calculateLoadingStatus(data.tradeState),
      appearance: this.providerIndex === 0 ? 'normal' : 'small'
    };

    if (hasError) {
      this.setupError(data.error);
    } else {
      this.setupProviderData(data);
    }
  }

  /**
   * Calculates loading state.
   * @param tradeState Instant trade status.
   * @returns isLoading Is instant trade currently loading.
   */
  private calculateLoadingStatus(tradeState: INSTANT_TRADES_STATUS): boolean {
    switch (tradeState) {
      case INSTANT_TRADES_STATUS.CALCULATION:
      case INSTANT_TRADES_STATUS.TX_IN_PROGRESS: {
        return true;
      }
      default: {
        return false;
      }
    }
  }

  /**
   * Transform input controller data to comfortable.
   * @param data Provider controller data.
   */
  private setupProviderData(data: ProviderControllerData): void {
    this.tradeData = {
      blockchain: data?.trade?.blockchain,
      amount: data?.trade?.to?.amount,
      gasLimit: data?.trade?.gasLimit,
      gasFeeInUsd: data?.trade?.gasFeeInUsd,
      gasFeeInEth: data?.trade?.gasFeeInEth,
      usdPrice: data?.trade?.to?.amount?.multipliedBy(data?.trade?.to?.token?.price),
      toTokenDecimals: data?.trade?.to?.token?.decimals
    };
  }

  /**
   * Setup errors in current instant trade.
   * @param error Provider error.
   */
  private setupError(error: RubicError<ERROR_TYPE>): void {
    this.errorTranslateKey =
      error?.type === ERROR_TYPE.TEXT ? error.translateKey || error.message : 'errors.rubicError';
  }
}
