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
import { DepositFormInfo } from '../../deposit-form-info';
import { BehaviorSubject } from 'rxjs';
import { DEPOSIT_STEP_ORDER } from '../../deposit-step-order';
import { ModalService } from '@app/core/modals/services/modal.service';
import { CrossChainTradeType } from '@cryptorubic/core';
import { TradePageService } from '@app/features/trade/services/trade-page/trade-page.service';
import { InputAddressesStepAction } from '../../deposit-form-step-actions';
import { IWithOnDestroy } from '../abstracts/interfaces';

export class InputAddressesStep
  extends DepositStepWithAction<InputAddressesStepAction>
  implements IWithOnDestroy
{
  public readonly name: DepositStepName = DEPOSIT_STEP_NAME.INPUT_ADDRESSES;

  public inputsForm = new FormGroup<InputAddressesStepForm>({
    receiverAddr: new FormControl('', [Validators.required]),
    refundAddr: new FormControl('', [Validators.required])
  });

  constructor(
    _depositFormInfo$: BehaviorSubject<DepositFormInfo>,
    _depositFormSteps$: BehaviorSubject<DepositFormSteps>,
    private readonly depositService: DepositService,
    private readonly modalService: ModalService,
    private readonly tradePageService: TradePageService
  ) {
    const depositStepParams: DepositStepParams = { active: true, loading: false, opened: true };
    const actionBtnState: ActionBtnState = {
      active: false,
      text: 'Confirm Addresses'
    };
    super(depositStepParams, _depositFormInfo$, _depositFormSteps$, actionBtnState);
    this.initValidators();
  }

  public async doAction(action: InputAddressesStepAction): Promise<void> {
    if (action === 'confirm_addresses') {
      this.confirmAddresses();
    } else {
      this.changeAddresses();
    }
  }

  public onDestroy(): void {
    throw new Error('Method not implemented.');
  }

  private async confirmAddresses(): Promise<void> {
    const receiverAddr = this.inputsForm.controls.receiverAddr.value;
    const nextStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.TRADE_INFO];
    nextStep.setActive(true);
    nextStep.setLoading(true);

    for (const ctrl in this.inputsForm.controls) {
      this.inputsForm.get(ctrl).disable();
    }

    try {
      const paymentInfo = await this.depositFormInfo.trade.getTransferTrade(receiverAddr);
      this.depositService.updateTrade(paymentInfo, receiverAddr);
      this.depositService.setupUpdate();
      this.updateActionBtnState({ text: 'Change Addresses' });
    } catch (err) {
      console.error(`[InputAddressesStep_doAction] err: ${err}`);
      const backToForm = await this.modalService.openDepositTradeRateChangedModal(
        this.depositFormInfo.trade.type as CrossChainTradeType
      );
      if (backToForm) this.tradePageService.setState('form');
    }
  }

  private changeAddresses(): void {
    const tradeInfoStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.TRADE_INFO];
    tradeInfoStep.setActive(false);
    tradeInfoStep.setLoading(false);
    tradeInfoStep.setOpened(false);

    this.setActive(true);

    for (const ctrl in this.inputsForm.controls) {
      this.inputsForm.get(ctrl).enable();
    }

    this.updateActionBtnState({ text: 'Confirm Addresses' });
  }

  private initValidators(): void {
    this.inputsForm.controls.receiverAddr.setAsyncValidators([
      isWalletAddressCorrect(this.depositFormInfo.trade.to.blockchain)
    ]);
    this.inputsForm.controls.refundAddr.setAsyncValidators([
      isWalletAddressCorrect(this.depositFormInfo.trade.from.blockchain)
    ]);
  }
}
