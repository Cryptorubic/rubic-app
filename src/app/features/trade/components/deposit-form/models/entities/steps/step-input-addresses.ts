import { FormControl, FormGroup, Validators } from '@angular/forms';
import { isWalletAddressCorrect } from '@app/features/privacy/providers/clearswap/constants/receiver-validator';
import { DepositStepWithAction } from '../abstracts/deposit-step-with-action';
import {
  DEPOSIT_STEP_NAME,
  DepositFormSteps,
  DepositStepName
} from '../../deposit-form-step-types';
import { ActionBtnState, DepositStepParams, InputAddressesStepForm } from '../../step-types';
import { DepositService } from '@app/features/trade/services/deposit/deposit.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DEPOSIT_STEP_ORDER } from '../../deposit-step-order';
import { ModalService } from '@app/core/modals/services/modal.service';
import { CrossChainTradeType, TokenAmount } from '@cryptorubic/core';
import { TradePageService } from '@app/features/trade/services/trade-page/trade-page.service';
import { InputAddressesStepAction } from '../../deposit-form-step-actions';
import { IWithHooks } from '../abstracts/interfaces';
import { DEPOSIT_FORM_STATE, DepositFormState } from '../../deposit-form-states';
import { SwapsStateService } from '@app/features/trade/services/swaps-state/swaps-state.service';
import { TransferTrade } from '../../deposit-form-info';
import { CROSS_CHAIN_DEPOSIT_STATUS } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';

export class InputAddressesStep
  extends DepositStepWithAction<InputAddressesStepAction>
  implements IWithHooks
{
  public readonly name: DepositStepName = DEPOSIT_STEP_NAME.INPUT_ADDRESSES;

  public inputsForm = new FormGroup<InputAddressesStepForm>({
    receiverAddr: new FormControl('', [Validators.required]),
    refundAddr: new FormControl('', [Validators.required])
  });

  private readonly _subs: Subscription[] = [];

  constructor(
    _depositFormState$: BehaviorSubject<DepositFormState>,
    _depositFormSteps$: BehaviorSubject<DepositFormSteps>,
    private readonly swapsStateService: SwapsStateService,
    private readonly depositService: DepositService,
    private readonly modalService: ModalService,
    private readonly tradePageService: TradePageService
  ) {
    const depositStepParams: DepositStepParams = { active: true, loading: false, opened: true };
    const actionButtonsMap: Record<InputAddressesStepAction, ActionBtnState> = {
      confirm_addresses: {
        active: false,
        text: 'Confirm Addresses'
      },
      change_addresses: {
        active: false,
        text: 'Change Addresses'
      }
    };
    super(depositStepParams, _depositFormState$, _depositFormSteps$, actionButtonsMap);
  }

  public async doAction(action: InputAddressesStepAction): Promise<void> {
    if (action === 'confirm_addresses') {
      await this.confirmAddresses();
    } else {
      await this.changeAddresses();
    }
  }

  public onInit(): void {
    this.initValidators();

    const formStatusSub = this.inputsForm.statusChanges.subscribe(status => {
      this.updateActionBtnState('confirm_addresses', { active: status === 'VALID' });
    });
    const tradeStatusSub = this.depositService.status$.subscribe(status => {
      if (status === CROSS_CHAIN_DEPOSIT_STATUS.WAITING) return;

      const tradeStatusStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.TRADE_STATUS];

      tradeStatusStep.setActive(true);
      tradeStatusStep.setOpened(true);
      this.setOpened(false);
      this.setActive(false);

      this._depositFormState$.next(
        status === CROSS_CHAIN_DEPOSIT_STATUS.FINISHED
          ? DEPOSIT_FORM_STATE.COMPLETED
          : DEPOSIT_FORM_STATE.STATUS_TRACKING
      );
      this.triggerStepsUpdate();
    });

    this._subs.push(formStatusSub, tradeStatusSub);
  }

  public onDestroy(): void {
    this._subs.forEach(sub => sub.unsubscribe());
  }

  private async confirmAddresses(): Promise<void> {
    const receiverAddr = this.inputsForm.controls.receiverAddr.value;
    const refundAddr = this.inputsForm.controls.refundAddr.value;
    const tradeInfoStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.TRADE_INFO];
    const detailsStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS];

    this.setOpened(false);
    tradeInfoStep.setLoading(true);
    for (const ctrl in this.inputsForm.controls) {
      this.inputsForm.get(ctrl).disable();
    }
    this.triggerStepsUpdate();

    try {
      const selectedTrade = this.swapsStateService.tradeState.trade as TransferTrade;
      const paymentInfo = await selectedTrade.getTransferTrade(receiverAddr, refundAddr);

      await this.depositService.updateTrade(paymentInfo, receiverAddr);
      this.depositService.setupUpdate();

      const dstTokenUpdated = new TokenAmount({
        ...detailsStep.depositDetails.srcToken.asStruct,
        tokenAmount: paymentInfo.toAmount
      });
      detailsStep.updateDepositDetails({ dstToken: dstTokenUpdated });

      this.updateActionBtnState('confirm_addresses', { active: false });
      this.updateActionBtnState('change_addresses', { active: true });

      this._depositFormState$.next(DEPOSIT_FORM_STATE.WAITING_FOR_SENDING_DEPOSIT);
      tradeInfoStep.setActive(true);
      tradeInfoStep.setLoading(false);
      tradeInfoStep.setOpened(true);
    } catch {
      const backToForm = await this.modalService.openDepositTradeRateChangedModal(
        this.swapsStateService.tradeState.tradeType as CrossChainTradeType
      );
      if (backToForm) {
        this.tradePageService.setState('form');
      } else {
        // @TODO_3003 use DEPOSIT_FORM_STATE.ERROR
        this._depositFormState$.next(DEPOSIT_FORM_STATE.EXPIRED);
        this.depositFormSteps.forEach(step => {
          step.setActive(false);
          step.setOpened(false);
          step.setLoading(false);
        });
      }
    }
  }

  private changeAddresses(): void {
    const tradeInfoStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.TRADE_INFO];
    tradeInfoStep.setActive(false);
    tradeInfoStep.setLoading(false);
    tradeInfoStep.setOpened(false);

    for (const ctrl in this.inputsForm.controls) {
      this.inputsForm.get(ctrl).enable();
    }

    this.updateActionBtnState('change_addresses', { active: false });
    this.updateActionBtnState('confirm_addresses', { active: true });
    this.depositService.cleanup();
    this._depositFormState$.next(DEPOSIT_FORM_STATE.IDLE);
  }

  private initValidators(): void {
    const detailsStep = this._depositFormSteps$.value[DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS];
    this.inputsForm.controls.receiverAddr.setAsyncValidators([
      isWalletAddressCorrect(detailsStep.depositDetails.dstToken.blockchain)
    ]);
    this.inputsForm.controls.refundAddr.setAsyncValidators([
      isWalletAddressCorrect(detailsStep.depositDetails.srcToken.blockchain)
    ]);
  }
}
