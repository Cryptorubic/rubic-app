import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DEPOSIT_FORM_STATE } from '../models/deposit-form-states';
import { DepositFormSteps } from '../models/deposit-form-step-types';
import { isDepositStepWithAction } from '../models/entities/abstracts/deposit-step-with-action';
import { DEPOSIT_STEP_ORDER } from '../models/deposit-step-order';
import { ExchangeDetailsStep } from '../models/entities/steps/step-exchange-details';
import { InputAddressesStep } from '../models/entities/steps/step-input-addresses';
import { TradeInfoStep } from '../models/entities/steps/step-trade-info';
import { TradeStatusStep } from '../models/entities/steps/step-trade-status';
import { SwapsStateService } from '@app/features/trade/services/swaps-state/swaps-state.service';
import { DepositFormDetails } from '../models/step-types';
import { TokenAmount } from '@cryptorubic/core';
import { DepositFormInfo, TransferTrade } from '../models/deposit-form-info';
import { DepositService } from '@app/features/trade/services/deposit/deposit.service';
import { ModalService } from '@app/core/modals/services/modal.service';
import { TradePageService } from '@app/features/trade/services/trade-page/trade-page.service';
import { STEP_ACTION } from '../models/deposit-form-step-actions';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { withOnDestroy } from '../models/entities/abstracts/interfaces';

@Injectable()
export class DepositFormManager {
  private readonly _depositFormInfo$: BehaviorSubject<DepositFormInfo>;

  public readonly depositFormInfo$: Observable<DepositFormInfo>;

  public get depositFormInfo(): DepositFormInfo {
    return this._depositFormInfo$.value;
  }

  public patchDepositFormInfo(newInfo: Partial<DepositFormInfo>): void {
    this._depositFormInfo$.next({ ...this.depositFormInfo, ...newInfo });
  }

  private readonly _depositFormSteps$: BehaviorSubject<DepositFormSteps>;

  public readonly depositFormSteps$: Observable<DepositFormSteps>;

  public get depositFormSteps(): DepositFormSteps {
    return this._depositFormSteps$.value;
  }

  public readonly tradeStatus$ = this.depositService.status$;

  constructor(
    private readonly swapsStateService: SwapsStateService,
    private readonly depositService: DepositService,
    modalService: ModalService,
    tradePageService: TradePageService
  ) {
    this._depositFormInfo$ = new BehaviorSubject<DepositFormInfo>({
      state: DEPOSIT_FORM_STATE.IDLE,
      trade: this.swapsStateService.tradeState.trade as TransferTrade
    });
    this.depositFormInfo$ = this._depositFormInfo$.asObservable();

    const depositDetails: DepositFormDetails = {
      srcToken: new TokenAmount(this.swapsStateService.tradeState.trade.from),
      dstToken: new TokenAmount(this.swapsStateService.tradeState.trade.to)
    };
    this._depositFormSteps$ = new BehaviorSubject<DepositFormSteps>([
      new ExchangeDetailsStep(this._depositFormInfo$, this._depositFormSteps$, depositDetails),
      new InputAddressesStep(
        this._depositFormInfo$,
        this._depositFormSteps$,
        depositService,
        modalService,
        tradePageService
      ),
      new TradeInfoStep(this._depositFormInfo$, this._depositFormSteps$),
      new TradeStatusStep(this._depositFormInfo$, this._depositFormSteps$)
    ]);
    this.depositFormSteps$ = this._depositFormSteps$.asObservable();
  }

  public async doAction<K extends DEPOSIT_STEP_ORDER>(
    stepOrder: K,
    stepAction: (typeof STEP_ACTION)[K][number]
  ): Promise<void> {
    const depositStep = this.depositFormSteps[stepOrder];
    if (!isDepositStepWithAction(depositStep)) return;
    await depositStep.doAction(stepAction as RubicAny);
    this._depositFormSteps$.next(this.depositFormSteps);
  }

  public cleanup(): void {
    this.depositFormSteps.forEach(step => {
      if (withOnDestroy(step)) step.onDestroy();
    });
    this.depositService.subs.forEach(sub => sub.unsubscribe());
  }
}
