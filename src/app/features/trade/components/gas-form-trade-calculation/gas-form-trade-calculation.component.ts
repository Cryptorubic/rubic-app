import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TradeState } from '../../models/trade-state';
import { FeeInfo, RubicStep } from 'rubic-sdk';
import { AppFeeInfo, AppGasData, ProviderInfo } from '../../models/provider-info';
import { BehaviorSubject, interval, map, switchMap, takeWhile } from 'rxjs';
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

  public readonly percentsDone$ = this._isCalculation$.pipe(
    switchMap(bool => interval(this.ratio).pipe(takeWhile(() => bool))),
    takeWhile(val => val <= CALCULATION_TIMEOUT_MS / this.ratio),
    map(val => this.convertIntervalValueToPercents(val))
  );

  public readonly calculationText$ = this.percentsDone$.pipe(
    map(percents => this.getCalcTextForDifferentPercentsRange(percents))
  );

  public readonly bestTrade$ = this.gasFormService.bestTrade$;

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
    private readonly tradeInfoManager: TradeInfoManager
  ) {}

  public getGasData(state: TradeState): AppGasData | null {
    return this.tradeInfoManager.getGasData(state.trade);
  }

  public getFeeInfo(state: TradeState): AppFeeInfo {
    return this.tradeInfoManager.getFeeInfo(state.trade);
  }

  public getProviderInfo(state: TradeState): ProviderInfo {
    return this.tradeInfoManager.getProviderInfo(state.tradeType);
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
