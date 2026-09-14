import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DEPOSIT_FORM_STATE } from '../models/deposit-form-states';
import { DepositFormSteps } from '../models/deposit-form-step-types';
import { isDepositStepWithAction } from '../entities/abstracts/deposit-step-with-action';
import { DEPOSIT_STEP_ORDER } from '../models/deposit-step-order';
import { ExchangeDetailsStep } from '../entities/steps/step-exchange-details';
import { InputAddressesStep } from '../entities/steps/step-input-addresses';
import { TradeInfoStep } from '../entities/steps/step-trade-info';
import { TradeStatusStep } from '../entities/steps/step-trade-status';
import { SwapsStateService } from '@app/features/trade/services/swaps-state/swaps-state.service';
import { DepositFormDetails } from '../models/step-types';
import { TokenAmount } from '@cryptorubic/core';
import { DepositFormInfo } from '../models/deposit-form-info';
import { DEPOSIT_FORM_TITLE } from '../constants/deposit-form-titles';

@Injectable()
export class DepositFormManager {
  private readonly _depositFormInfo$ = new BehaviorSubject<DepositFormInfo>({
    state: DEPOSIT_FORM_STATE.IDLE,
    title: DEPOSIT_FORM_TITLE[DEPOSIT_FORM_STATE.IDLE]
  });

  public readonly depositFormInfo$ = this._depositFormInfo$.asObservable();

  public get depositFormInfo(): DepositFormInfo {
    return this._depositFormInfo$.value;
  }

  private readonly _depositFormSteps$: BehaviorSubject<DepositFormSteps>;

  public readonly depositFormSteps$: Observable<DepositFormSteps>;

  public get depositFormSteps(): DepositFormSteps {
    return this._depositFormSteps$.value;
  }

  public patchDepositFormState(state: Partial<DepositFormInfo>): void {
    this._depositFormInfo$.next({ ...this.depositFormInfo, ...state });
  }

  constructor(private readonly swapsStateService: SwapsStateService) {
    const depositDetails: DepositFormDetails = {
      srcToken: new TokenAmount(this.swapsStateService.tradeState.trade.from),
      dstToken: new TokenAmount(this.swapsStateService.tradeState.trade.to)
    };
    this._depositFormSteps$ = new BehaviorSubject<DepositFormSteps>([
      new ExchangeDetailsStep(depositDetails),
      new InputAddressesStep(depositDetails),
      new TradeInfoStep(depositDetails),
      new TradeStatusStep(depositDetails)
    ]);
    this.depositFormSteps$ = this._depositFormSteps$.asObservable();
  }

  public async doAction(stepOrder: DEPOSIT_STEP_ORDER): Promise<void> {
    const depositStep = this.depositFormSteps[stepOrder];
    if (!isDepositStepWithAction(depositStep)) return;
    await depositStep.doAction();
    this._depositFormSteps$.next(this.depositFormSteps);
  }
}
