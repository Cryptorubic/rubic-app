import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { INSTANT_TRADES_STATUS } from 'src/app/features/swaps-page-old/instant-trades/models/instant-trades-trade-status';
import { PROVIDERS } from 'src/app/features/swaps-page-old/instant-trades/models/providers.enum';
import BigNumber from 'bignumber.js';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';

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
  options?: any;
}

export interface ProviderControllerData {
  trade: InstantTrade<BlockchainToken>;
  tradeState: INSTANT_TRADES_STATUS;
  tradeProviderInfo: {
    label: string;
    value: PROVIDERS;
  };
  isBestRate: boolean;
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

  isBestRate: boolean;
}

@Component({
  selector: 'app-provider-panel',
  templateUrl: './provider-panel.component.html',
  styleUrls: ['./provider-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProviderPanelComponent implements OnInit {
  @Input() public set providerControllerData(data: ProviderControllerData) {
    if (data) {
      this.setupProviderData(data);
    }
  }

  public providerData: ProviderData;

  public loading: boolean;

  public collapsed: boolean;

  public hasError: boolean;

  constructor() {
    this.loading = false;
    this.collapsed = true;
  }

  public ngOnInit(): void {
    if (this.providerData.isBestRate) {
      this.collapsed = false;
    }
  }

  public collapsePanel(): void {
    this.collapsed = !this.collapsed;
  }

  private setupProviderData(data: ProviderControllerData): void {
    this.calculateState(data.tradeState);
    this.providerData = {
      name: data.tradeProviderInfo.label,
      amount: data.trade.to.amount,
      estimatedGas: data.trade.estimatedGas,
      gasFeeInEth: data.trade.gasFeeInEth,
      gasFeeInUsd: data.trade.gasFeeInUsd,
      isBestRate: data.isBestRate
    };
  }

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
}
