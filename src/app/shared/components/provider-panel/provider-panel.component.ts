import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { INSTANT_TRADES_STATUS } from 'src/app/features/instant-trade/models/instant-trades-trade-status';
import BigNumber from 'bignumber.js';
import { INSTANT_TRADES_PROVIDER } from 'src/app/shared/models/instant-trade/INSTANT_TRADES_PROVIDER';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { RubicError } from 'src/app/core/errors/models/RubicError';

export interface InstantTrade<T> {
  from: {
    token: T;
    amount: BigNumber;
  };
  to: {
    token: T;
    amount: BigNumber;
  };
  estimatedGas: BigNumber;
  gasFeeInUsd: BigNumber;
  gasFeeInEth: BigNumber;
  options?: unknown;
}

export interface ProviderControllerData {
  trade: InstantTrade<TokenAmount>;
  tradeState: INSTANT_TRADES_STATUS;
  tradeProviderInfo: {
    label: string;
    value: INSTANT_TRADES_PROVIDER;
  };
  isBestRate: boolean;
  isSelected: boolean;
  isCollapsed: boolean;
  needApprove: boolean;
  error?: RubicError;
}

interface ProviderData {
  /**
   * Provider name.
   */
  name: string;
  /**
   * Amount of output without slippage in absolute token units (WITHOUT decimals).
   */
  amount: BigNumber;
  /**
   * Amount of predicted gas limit in absolute gas units.
   */
  estimatedGas: BigNumber;
  /**
   * Amount of predicted gas fee in usd$.
   */
  gasFeeInUsd: BigNumber;
  /**
   * Amount of predicted gas fee in Ether.
   */
  gasFeeInEth: BigNumber;
  /**
   * Is provider has best rate.
   */
  isBestRate: boolean;
  /**
   * Is provider active.
   */
  isActive: boolean;
  /**
   * Is provider collapsed.
   */
  isCollapsed: boolean;

  error: string;
}

@Component({
  selector: 'app-provider-panel',
  templateUrl: './provider-panel.component.html',
  styleUrls: ['./provider-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProviderPanelComponent {
  /**
   * Setup provider data.
   * @param data provider controller data.
   */
  @Input() public set providerControllerData(data: ProviderControllerData) {
    if (data) {
      this.setupProviderData(data);
    }
  }

  /**
   * Provider selection event.
   */
  @Output() public collapseProvider: EventEmitter<boolean>;

  /**
   * Provider selection event.
   */
  @Output() public selectProvider: EventEmitter<void>;

  public get gasFeeDisplay(): boolean {
    return (
      this.tradeData.gasFeeInEth &&
      this.tradeData.to.token.blockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN &&
      this.tradeData.to.token.blockchain !== BLOCKCHAIN_NAME.POLYGON
    );
  }

  public tradeData: InstantTrade<TokenAmount>;

  /**
   * Provider data.
   */
  public providerData: ProviderData;

  /**
   * Does current provider loading.
   */
  public loading: boolean;

  /**
   * Does current have errors.
   */
  public hasError: boolean;

  /**
   * Does current provider selected.
   */
  public active: boolean;

  constructor() {
    this.loading = false;
    this.collapseProvider = new EventEmitter<boolean>();
    this.selectProvider = new EventEmitter<void>();
  }

  /**
   * Emit provider selection event to parent component.
   */
  public activateProvider(): void {
    if (!this.loading && !this.hasError) {
      this.collapseProvider.emit(!this.providerData.isCollapsed);
      this.selectProvider.emit();
    }
  }

  /**
   * @description Transform input controller data to comfortable.
   * @param data Provider controller data.
   */
  private setupProviderData(data: ProviderControllerData): void {
    this.calculateState(data.tradeState);
    this.providerData = {
      name: data.tradeProviderInfo.label,
      amount: data.trade?.to?.amount,
      estimatedGas: data.trade?.estimatedGas,
      gasFeeInEth: data.trade?.gasFeeInEth,
      gasFeeInUsd: data.trade?.gasFeeInUsd,
      isBestRate: data.isBestRate,
      isActive: data.isSelected,
      isCollapsed: data.isCollapsed,
      error: null
    };
    if (this.hasError) {
      this.providerData.error =
        data?.error?.type === 'text'
          ? data.error.translateKey || data.error.message
          : 'errors.rubicError';
    }
    this.tradeData = data.trade;
  }

  /**
   * @desc Calculate provider state based on controller status.
   * @param state Instant trade status.
   */
  private calculateState(state: INSTANT_TRADES_STATUS): void {
    switch (state) {
      case INSTANT_TRADES_STATUS.ERROR: {
        this.hasError = true;
        this.loading = false;
        break;
      }
      case INSTANT_TRADES_STATUS.CALCULATION:
      case INSTANT_TRADES_STATUS.TX_IN_PROGRESS: {
        this.hasError = false;
        this.loading = true;
        break;
      }
      case INSTANT_TRADES_STATUS.COMPLETED:
      case INSTANT_TRADES_STATUS.APPROVAL:
      default: {
        this.hasError = false;
        this.loading = false;
        break;
      }
    }
  }

  getUsdPrice(): string {
    return this.tradeData.to.amount.multipliedBy(this.tradeData.to.token.price).toFixed(2);
  }
}
