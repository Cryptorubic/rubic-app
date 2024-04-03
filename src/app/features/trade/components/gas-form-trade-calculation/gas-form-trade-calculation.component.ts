import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Self } from '@angular/core';
import { TradeState } from '../../models/trade-state';
import { FeeInfo, RubicStep } from 'rubic-sdk';
import { AppGasData, ProviderInfo } from '../../models/provider-info';
import { BehaviorSubject, interval, map, switchMap, takeUntil, takeWhile } from 'rxjs';
import { CALCULATION_TIMEOUT_MS } from '../../constants/calculation';
import { GasFormService } from '../../services/gas-form/gas-form.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapsFormService } from '../../services/swaps-form/swaps-form.service';
import { Token } from '@app/shared/models/tokens/token';
import { TradeInfoManager } from '../../services/trade-info-manager/trade-info-manager.service';

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
    this._isCalculation$.next(bool);
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

  public calculationText$ = this.percentsDone$.pipe(
    map(percents => this.getCalcTextForDifferentPercentsRange(percents))
  );

  public gasData: AppGasData | null;

  public feeInfo: {
    fee: FeeInfo | null;
    nativeToken: Token;
  };

  public providerInfo: ProviderInfo;

  public routePath: RubicStep[];

  constructor(
    private readonly gasFormService: GasFormService,
    private readonly swapsFormService: SwapsFormService,
    private readonly tradeInfoManager: TradeInfoManager,
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
    this.feeInfo = this.tradeInfoManager.getFeeInfo(trade);
    this.gasData = this.tradeInfoManager.getGasData(trade);
    this.providerInfo = this.tradeInfoManager.getProviderInfo(trade.type);
  }

  private convertIntervalValueToPercents(val: number): number {
    return val * ((this.max * this.ratio) / CALCULATION_TIMEOUT_MS);
  }

  private getCalcTextForDifferentPercentsRange(percentsDone: number): string {
    if (percentsDone < 33) {
      return 'Finding best route...';
    }
    if (percentsDone < 67) {
      return 'Calculating providers...';
    }
    return 'A bit more...';
  }
}
