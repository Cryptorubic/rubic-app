import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, startWith, takeUntil, tap } from 'rxjs/operators';
import { LpProvidingService } from '../../services/lp-providing.service';
import BigNumber from 'bignumber.js';
import { BehaviorSubject } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { LiquidityPeriod } from '../../models/stake-period.enum';

enum LiquidityPeriodInMonth {
  SHORT = '1m',
  AVERAGE = '3m',
  LONG = '6m'
}

const LIQUIDITY_PERIOD_BY_MONTH = {
  [LiquidityPeriodInMonth.SHORT]: LiquidityPeriod.SHORT,
  [LiquidityPeriodInMonth.AVERAGE]: LiquidityPeriod.AVERAGE,
  [LiquidityPeriodInMonth.LONG]: LiquidityPeriod.LONG
};

@Component({
  selector: 'app-deposit-form',
  templateUrl: './deposit-form.component.html',
  styleUrls: ['./deposit-form.component.scss'],
  providers: [TuiDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositFormComponent implements OnInit {
  public readonly liquidityPeriodCtrl = new FormControl(30);

  public readonly liquidityPeriodHotkeys = Object.values(LiquidityPeriodInMonth);

  public readonly rbcAmountCtrl = new FormControl(this.service.minEnterAmount);

  private readonly _rbcAmountUsdPrice$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly rbcAmountUsdPrice$ = this._rbcAmountUsdPrice$.asObservable();

  private readonly _rbcAmount$ = this.rbcAmountCtrl.valueChanges.pipe(
    startWith(this.rbcAmountCtrl.value),
    debounceTime(300),
    tap(async () => {
      // const amountUsdPrice = await this.service.calculateUsdPrice(new BigNumber(amount), 'brbc');
      this._rbcAmountUsdPrice$.next(new BigNumber(1231.323));
    }),
    takeUntil(this.destroy$)
  );

  public readonly usdcAmountCtrl = new FormControl();

  private readonly _usdcAmountUsdPrice$ = new BehaviorSubject<BigNumber>(undefined);

  public readonly usdcAmountUsdPrice$ = this._usdcAmountUsdPrice$.asObservable();

  constructor(
    private readonly service: LpProvidingService,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this._rbcAmount$.subscribe();
  }

  public stake(): void {}

  public setMaxTokenAmount(token: 'rbc' | 'usdc'): void {
    if (token === 'rbc') {
      this.rbcAmountCtrl.setValue(100);
    } else {
      this.usdcAmountCtrl.setValue(100);
    }
  }

  public setLiquidityTimeHotkey(value: LiquidityPeriodInMonth): void {
    this.liquidityPeriodCtrl.setValue(LIQUIDITY_PERIOD_BY_MONTH[value]);
  }
}
