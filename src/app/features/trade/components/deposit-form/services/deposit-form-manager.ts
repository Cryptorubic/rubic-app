import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DEPOSIT_FORM_STATE, DepositFormState } from '../models/deposit-form-states';
import { DepositFormSteps } from '../models/deposit-form-step-types';
import { isDepositStepWithAction } from '../models/entities/abstracts/deposit-step-with-action';
import { DEPOSIT_STEP_ORDER } from '../models/deposit-step-order';
import { ExchangeDetailsStep } from '../models/entities/steps/step-exchange-details';
import { InputAddressesStep } from '../models/entities/steps/step-input-addresses';
import { TradeInfoStep } from '../models/entities/steps/step-trade-info';
import { TradeStatusStep } from '../models/entities/steps/step-trade-status';
import { SwapsStateService } from '@app/features/trade/services/swaps-state/swaps-state.service';
import { ActionBtnState, DepositFormDetails } from '../models/step-types';
import { TokenAmount } from '@cryptorubic/core';
import { DepositService } from '@app/features/trade/services/deposit/deposit.service';
import { ModalService } from '@app/core/modals/services/modal.service';
import { TradePageService } from '@app/features/trade/services/trade-page/trade-page.service';
import { STEP_ACTION } from '../models/deposit-form-step-actions';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { withHooks } from '../models/entities/abstracts/interfaces';

@Injectable()
export class DepositFormManager {
  private readonly _depositFormState$ = new BehaviorSubject<DepositFormState>(
    DEPOSIT_FORM_STATE.IDLE
  );

  public readonly depositFormState$ = this._depositFormState$.asObservable();

  public get depositFormState(): DepositFormState {
    return this._depositFormState$.value;
  }

  public setDepositFormState(state: DepositFormState): void {
    this._depositFormState$.next(state);
  }

  private readonly _depositFormSteps$: BehaviorSubject<DepositFormSteps> =
    new BehaviorSubject<DepositFormSteps>([undefined, undefined, undefined, undefined]);

  public readonly depositFormSteps$ = this._depositFormSteps$.asObservable();

  public get depositFormSteps(): DepositFormSteps {
    return this._depositFormSteps$.value as DepositFormSteps;
  }

  public readonly tradeStatus$ = this.depositService.status$;

  public readonly depositTrade$ = this.depositService.depositTrade$;

  constructor(
    private readonly swapsStateService: SwapsStateService,
    private readonly depositService: DepositService,
    modalService: ModalService,
    tradePageService: TradePageService
  ) {
    const depositDetails: DepositFormDetails = {
      srcToken: new TokenAmount(this.swapsStateService.tradeState.trade.from),
      dstToken: new TokenAmount(this.swapsStateService.tradeState.trade.to)
    };
    const steps: DepositFormSteps = [
      new ExchangeDetailsStep(this._depositFormState$, this._depositFormSteps$, depositDetails),
      new InputAddressesStep(
        this._depositFormState$,
        this._depositFormSteps$,
        swapsStateService,
        depositService,
        modalService,
        tradePageService
      ),
      new TradeInfoStep(this._depositFormState$, this._depositFormSteps$),
      new TradeStatusStep(this._depositFormState$, this._depositFormSteps$)
    ];
    this._depositFormSteps$.next(steps);
  }

  public init(): void {
    this.depositFormSteps.forEach(step => {
      if (withHooks(step)) step.onInit();
    });
  }

  public cleanup(): void {
    this.depositFormSteps.forEach(step => {
      if (withHooks(step)) step.onDestroy();
    });
    this.depositService.cleanup();
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

  public getActionBtnState(stepOrder: DEPOSIT_STEP_ORDER): ActionBtnState {
    const depositStep = this.depositFormSteps[stepOrder];
    if (!isDepositStepWithAction(depositStep)) {
      throw new Error(`${depositStep.name} doesn't have action button!`);
    }
    return depositStep.actionBtnState;
  }
}
