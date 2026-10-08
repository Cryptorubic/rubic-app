import { ChangeDetectorRef, DestroyRef, Inject, Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DEPOSIT_FORM_STATE, DepositFormState } from '../../models/deposit-form-states';
import { DepositFormSteps } from '../../models/deposit-form-step-types';
import { isDepositStepWithAction } from '../../models/entities/abstracts/deposit-step-with-action';
import { DEPOSIT_STEP_ORDER } from '../../models/deposit-step-order';
import { ExchangeDetailsStep } from '../../models/entities/steps/step-exchange-details';
import { InputAddressesStep } from '../../models/entities/steps/step-input-addresses';
import { TradeInfoStep } from '../../models/entities/steps/step-trade-info';
import { TradeStatusStep } from '../../models/entities/steps/step-trade-status';
import { SwapsStateService } from '@app/features/trade/services/swaps-state/swaps-state.service';
import { ActionBtnState, DepositFormDetails } from '../../models/step-types';
import { TokenAmount } from '@cryptorubic/core';
import { DepositService } from '@app/features/trade/services/deposit/deposit.service';
import { ModalService } from '@app/core/modals/services/modal.service';
import { TradePageService } from '@app/features/trade/services/trade-page/trade-page.service';
import { STEP_ACTION } from '../../models/deposit-form-step-actions';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { isStepWithHooks } from '../../models/entities/abstracts/interfaces';
import { SwapsControllerService } from '@app/features/trade/services/swaps-controller/swaps-controller.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { ErrorsService } from '@app/core/errors/errors.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HeaderStore } from '@app/core/header/services/header.store';
import { TargetNetworkAddressService } from '@app/features/trade/services/target-network-address-service/target-network-address.service';
import { CROSS_CHAIN_DEPOSIT_STATUS } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';
import { DepositStepParamsFactory } from '../factory/deposit-step-params-factory';
import { DepositActionButtonsFactory } from '../factory/deposit-action-buttons-factory';
import { pairSupportsDepositFlowViaTxSign } from '../../utils/pair-supports-tx-flow';

@Injectable()
export class DepositFormManager {
  private readonly _depositFormState$: BehaviorSubject<DepositFormState>;

  public readonly depositFormState$: Observable<DepositFormState>;

  public get depositFormState(): DepositFormState {
    return this._depositFormState$.value;
  }

  private readonly _depositFormSteps$: BehaviorSubject<DepositFormSteps> =
    new BehaviorSubject<DepositFormSteps>([undefined, undefined, undefined, undefined]);

  public readonly depositFormSteps$ = this._depositFormSteps$.asObservable();

  public get depositFormSteps(): DepositFormSteps {
    return this._depositFormSteps$.value as DepositFormSteps;
  }

  public readonly tradeStatus$ = this.depositService.status$;

  public readonly depositTrade$ = this.depositService.depositTrade$;

  public readonly exchangeDuration$ = this.depositService.exchangeDuration$;

  constructor(
    private readonly depositService: DepositService,
    swapsStateService: SwapsStateService,
    modalService: ModalService,
    tradePageService: TradePageService,
    swapsControllerService: SwapsControllerService,
    walletConnectorService: WalletConnectorService,
    errorsService: ErrorsService,
    headerStore: HeaderStore,
    targetNetworkAddressService: TargetNetworkAddressService,
    @Inject(Injector) injector: Injector
  ) {
    const depositDetails: DepositFormDetails = {
      srcToken: new TokenAmount(swapsStateService.tradeState.trade.from),
      dstToken: new TokenAmount(swapsStateService.tradeState.trade.to)
    };
    const srcChain = depositDetails.srcToken.blockchain;

    this._depositFormState$ = new BehaviorSubject<DepositFormState>(
      pairSupportsDepositFlowViaTxSign(srcChain)
        ? DEPOSIT_FORM_STATE.IDLE
        : DEPOSIT_FORM_STATE.INPUT_ADDRESSES
    );
    this.depositFormState$ = this._depositFormState$.asObservable();

    const initialStepsParams = DepositStepParamsFactory.create(srcChain);
    const actionButtonsMap = DepositActionButtonsFactory.create(srcChain);

    const steps: DepositFormSteps = [
      new ExchangeDetailsStep(
        initialStepsParams[DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS],
        actionButtonsMap[DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS],
        this._depositFormState$,
        this._depositFormSteps$,
        depositDetails,
        injector,
        errorsService,
        walletConnectorService,
        modalService
      ),
      new InputAddressesStep(
        initialStepsParams[DEPOSIT_STEP_ORDER.INPUT_ADDRESSES],
        actionButtonsMap[DEPOSIT_STEP_ORDER.INPUT_ADDRESSES],
        this._depositFormState$,
        this._depositFormSteps$,
        swapsStateService,
        depositService,
        modalService,
        tradePageService,
        headerStore,
        targetNetworkAddressService,
        walletConnectorService
      ),
      new TradeInfoStep(
        initialStepsParams[DEPOSIT_STEP_ORDER.TRADE_INFO],
        actionButtonsMap[DEPOSIT_STEP_ORDER.TRADE_INFO],
        this._depositFormState$,
        this._depositFormSteps$,
        swapsStateService,
        swapsControllerService,
        walletConnectorService,
        modalService,
        errorsService,
        depositService,
        tradePageService
      ),
      new TradeStatusStep(
        initialStepsParams[DEPOSIT_STEP_ORDER.TRADE_STATUS],
        this._depositFormState$,
        this._depositFormSteps$
      )
    ];

    this._depositFormSteps$.next(steps);
  }

  public init(destroyRef: DestroyRef, cdr: ChangeDetectorRef): void {
    this.depositFormSteps.forEach(step => {
      if (isStepWithHooks(step)) step.onInit();
    });

    this.depositService.status$.pipe(takeUntilDestroyed(destroyRef)).subscribe(status => {
      if (status.status === CROSS_CHAIN_DEPOSIT_STATUS.WAITING) return;
      this._depositFormState$.next(
        status.status === CROSS_CHAIN_DEPOSIT_STATUS.FINISHED
          ? DEPOSIT_FORM_STATE.COMPLETED
          : DEPOSIT_FORM_STATE.STATUS_TRACKING
      );
    });

    this.depositFormState$.pipe(takeUntilDestroyed(destroyRef)).subscribe(state => {
      const detailsStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS];
      const inputAddressesStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.INPUT_ADDRESSES];
      const tradeInfoStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.TRADE_INFO];
      const tradeStatusStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.TRADE_STATUS];

      switch (state) {
        case DEPOSIT_FORM_STATE.IDLE:
          detailsStep.setActive(true);
          detailsStep.setOpened(true);

          inputAddressesStep.setActive(false);
          inputAddressesStep.setOpened(false);

          tradeInfoStep.setActive(false);
          tradeInfoStep.setOpened(false);

          tradeStatusStep.setActive(false);
          tradeStatusStep.setOpened(false);
          break;
        case DEPOSIT_FORM_STATE.INPUT_ADDRESSES:
          detailsStep.setActive(true);
          detailsStep.setOpened(true);
          console.log('INIT_MANAGER ==>', { valid: inputAddressesStep.inputsForm.valid });

          inputAddressesStep.setActive(true);
          inputAddressesStep.setOpened(true);
          inputAddressesStep.updateActionBtnState('confirm_addresses', {
            invisible: false,
            active: inputAddressesStep.inputsForm.valid
          });
          inputAddressesStep.updateActionBtnState('change_addresses', {
            invisible: false,
            active: true
          });

          tradeInfoStep.setActive(false);
          tradeInfoStep.setOpened(false);

          tradeStatusStep.setActive(false);
          tradeStatusStep.setOpened(false);
          break;
        case DEPOSIT_FORM_STATE.WAITING_FOR_SIGNING_TRANSFER:
          detailsStep.updateActionBtnState('select_manual_flow', { active: false });
          detailsStep.updateActionBtnState('select_via_wallet', { active: false });

          inputAddressesStep.setActive(true);
          inputAddressesStep.setOpened(true);
          inputAddressesStep.updateActionBtnState('confirm_addresses', {
            invisible: true
          });
          inputAddressesStep.updateActionBtnState('change_addresses', {
            invisible: true
          });

          tradeInfoStep.setActive(true);
          tradeInfoStep.setOpened(true);

          tradeStatusStep.setActive(false);
          tradeStatusStep.setOpened(false);
          break;
        case DEPOSIT_FORM_STATE.WAITING_FOR_SENDING_DEPOSIT:
          inputAddressesStep.setOpened(false);
          inputAddressesStep.updateActionBtnState('confirm_addresses', { active: false });
          inputAddressesStep.updateActionBtnState('change_addresses', { active: true });

          tradeInfoStep.setActive(true);
          tradeInfoStep.setOpened(true);
          tradeInfoStep.updateActionBtnState('confirm_deposit', {
            invisible: false,
            active: true
          });
          tradeInfoStep.updateActionBtnState('send_via_wallet', {
            invisible: false,
            active: true,
            loading: false
          });

          tradeStatusStep.setActive(false);
          tradeStatusStep.setOpened(false);
          break;
        case DEPOSIT_FORM_STATE.STATUS_TRACKING:
          inputAddressesStep.setOpened(false);
          inputAddressesStep.setActive(false);

          tradeInfoStep.setOpened(false);
          tradeInfoStep.updateActionBtnState('confirm_deposit', { active: false });
          tradeInfoStep.updateActionBtnState('send_via_wallet', { active: false });

          tradeStatusStep.setActive(true);
          tradeStatusStep.setOpened(true);
          break;
        case DEPOSIT_FORM_STATE.COMPLETED:
          inputAddressesStep.setOpened(false);
          inputAddressesStep.setActive(false);

          tradeInfoStep.setOpened(false);
          tradeInfoStep.setActive(false);
          break;
      }

      this._depositFormSteps$.next(this.depositFormSteps);
      cdr.detectChanges();
    });
  }

  public setInitialFormState(): void {
    const detailsStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS];
    const srcChain = detailsStep.depositDetails.srcToken.blockchain;

    if (pairSupportsDepositFlowViaTxSign(srcChain)) {
      this._depositFormState$.next(DEPOSIT_FORM_STATE.IDLE);
    } else {
      this._depositFormState$.next(DEPOSIT_FORM_STATE.INPUT_ADDRESSES);
    }
  }

  public cleanup(): void {
    this.depositFormSteps.forEach(step => {
      if (isStepWithHooks(step)) step.onDestroy();
    });
    this.setInitialFormState();
    this.depositService.cleanup();
  }

  public async doAction<K extends DEPOSIT_STEP_ORDER>(
    stepOrder: K,
    stepAction: (typeof STEP_ACTION)[K][number]
  ): Promise<void> {
    const depositStep = this.depositFormSteps[stepOrder];
    if (!isDepositStepWithAction(depositStep)) {
      throw new Error(`${depositStep.name} doesn't have an action!`);
    }

    // @ts-ignore
    await depositStep.doAction(stepAction as RubicAny);
    this._depositFormSteps$.next(this.depositFormSteps);
  }

  public getActionBtnState<K extends DEPOSIT_STEP_ORDER>(
    stepOrder: K,
    stepAction: (typeof STEP_ACTION)[K][number]
  ): ActionBtnState {
    const depositStep = this.depositFormSteps[stepOrder];
    if (!isDepositStepWithAction(depositStep)) {
      throw new Error(`${depositStep.name} doesn't have action button!`);
    }

    const actionBtuttonsMap = depositStep.actionButtonsMap as Record<
      (typeof STEP_ACTION)[K][number],
      ActionBtnState
    >;
    return actionBtuttonsMap[stepAction];
  }
}
