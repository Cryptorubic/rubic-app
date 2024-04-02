import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Self } from '@angular/core';
import { TradeState } from '../../models/trade-state';
import {
  BLOCKCHAIN_NAME,
  CrossChainTrade,
  EvmCrossChainTrade,
  EvmOnChainTrade,
  FeeInfo,
  OnChainTrade,
  RubicStep,
  Web3Pure,
  nativeTokensList
} from 'rubic-sdk';
import { ProviderInfo } from '../../models/provider-info';
import { TRADES_PROVIDERS } from '../../constants/trades-providers';
import { PlatformConfigurationService } from '@app/core/services/backend/platform-configuration/platform-configuration.service';
import { AppGasData } from '../../models/gas-types';
import { BehaviorSubject, interval, map, switchMap, takeUntil, takeWhile } from 'rxjs';
import { CALCULATION_TIMEOUT_MS } from '../../constants/calculation';
import { GasFormService } from '../../services/gas-form/gas-form.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapsFormService } from '../../services/swaps-form/swaps-form.service';
import { Token } from '@app/shared/models/tokens/token';

@Component({
  selector: 'app-gas-form-trade-calculation',
  templateUrl: './gas-form-trade-calculation.component.html',
  styleUrls: ['./gas-form-trade-calculation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class GasFormTradeCalculationComponent {
  @Input() max: number = 100;

  @Input({ required: true }) set isCalculation(bool: boolean) {
    this._isCalculation = bool;
    if (bool) {
      this._isCalculation$.next(bool);
    }
  }

  private _isCalculation: boolean = false;

  public get isCalculation(): boolean {
    return this._isCalculation;
  }

  public readonly nativeToken$ = this.swapsFormService.nativeToken$;

  private readonly _isCalculation$ = new BehaviorSubject(true);

  private readonly ratio: number = 100;

  public percentsDone$ = this._isCalculation$.pipe(
    switchMap(() => interval(this.ratio)),
    takeWhile(val => val <= CALCULATION_TIMEOUT_MS / this.ratio),
    map(val => this.convertIntervalValueToPercents(val))
  );

  public gasData: AppGasData | null;

  public feeInfo: {
    fee: FeeInfo | null;
    nativeToken: Token;
  };

  public providerInfo: ProviderInfo;

  public routePath: RubicStep[];

  constructor(
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly gasFormService: GasFormService,
    private readonly swapsFormService: SwapsFormService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.subOnBestTradeUpdate();
  }

  private subOnBestTradeUpdate(): void {
    this.gasFormService.bestTrade$.pipe(takeUntil(this.destroy$)).subscribe(tradeState => {
      this.onBestTradeUpdate(tradeState);
      this.cdr.markForCheck();
    });
  }

  private async onBestTradeUpdate(state: TradeState): Promise<void> {
    const trade = state.trade;
    this.routePath = state.routes;
    this.feeInfo = this.getFeeInfo(trade);
    this.gasData = this.getGasData(trade);
    this.providerInfo = this.getProviderInfo(trade as CrossChainTrade);
  }

  private getFeeInfo(trade: CrossChainTrade | OnChainTrade): {
    fee: FeeInfo | null;
    nativeToken: Token;
  } {
    const nativeToken = this.gasFormService.getNativeToken(trade.from.blockchain);
    return {
      fee: trade.feeInfo,
      nativeToken: nativeToken
    };
  }

  private getGasData(trade: CrossChainTrade | OnChainTrade): AppGasData {
    let gasData = null;
    let gasPrice = null;
    if (trade instanceof EvmCrossChainTrade) {
      gasData = trade.gasData;

      if (
        trade.from.blockchain !== BLOCKCHAIN_NAME.ETHEREUM &&
        trade.from.blockchain !== BLOCKCHAIN_NAME.FANTOM
      ) {
        gasPrice = gasData?.gasPrice?.gt(0)
          ? Web3Pure.fromWei(gasData.gasPrice)
          : Web3Pure.fromWei(gasData?.maxFeePerGas || 0);
      } else {
        gasPrice = gasData?.gasPrice?.gt(0)
          ? gasData.gasPrice
          : Web3Pure.fromWei(gasData?.maxFeePerGas || 0);
      }
    } else if (trade instanceof EvmOnChainTrade) {
      gasData = trade.gasFeeInfo;
      gasPrice = gasData?.gasPrice.gt(0) ? gasData.gasPrice : gasData?.maxFeePerGas;
    }

    if (!gasData || !gasData.gasLimit) {
      return null;
    }
    const blockchain = trade.from.blockchain;
    const nativeToken = nativeTokensList[blockchain];
    const nativeTokenPrice = this.gasFormService.getNativeToken(trade.from.blockchain)?.price || 0;
    const gasLimit = gasData?.gasLimit?.multipliedBy(gasPrice);

    return {
      amount: gasLimit,
      amountInUsd: gasLimit.multipliedBy(nativeTokenPrice),
      symbol: nativeToken.symbol
    };
  }

  private getProviderInfo(trade: CrossChainTrade): ProviderInfo {
    const provider = TRADES_PROVIDERS[trade.type];
    const providerAverageTime = this.platformConfigurationService.providersAverageTime;
    const currentProviderTime = providerAverageTime?.[trade.type];

    return {
      ...provider,
      averageTime: currentProviderTime ? currentProviderTime : provider.averageTime
    };
  }

  private convertIntervalValueToPercents(val: number): number {
    console.log(val);
    return val * ((this.max * this.ratio) / CALCULATION_TIMEOUT_MS);
  }
}
