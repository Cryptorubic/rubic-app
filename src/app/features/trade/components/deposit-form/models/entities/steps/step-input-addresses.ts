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
import { isRefundAddressRequired } from '@app/features/trade/services/refund-service/constants/refund-address-required-trade-types';
import { HeaderStore } from '@app/core/header/services/header.store';
import { TargetNetworkAddressService } from '@app/features/trade/services/target-network-address-service/target-network-address.service';
import { SelectedTrade } from '@app/features/trade/models/selected-trade';

export class InputAddressesStep
  extends DepositStepWithAction<InputAddressesStepAction>
  implements IWithHooks
{
  public readonly name: DepositStepName = DEPOSIT_STEP_NAME.INPUT_ADDRESSES;

  public inputsForm = new FormGroup<InputAddressesStepForm>({
    receiverAddr: new FormControl('', [Validators.required]),
    refundAddr: new FormControl('', [])
  });

  private readonly _subs: Subscription[] = [];

  /**
   * makes shallow copy of swapsStateService.tradeState because it reassigns new trade every 60 secs on recalculation
   */
  private readonly _tradeState: SelectedTrade;

  constructor(
    _depositFormState$: BehaviorSubject<DepositFormState>,
    _depositFormSteps$: BehaviorSubject<DepositFormSteps>,
    swapsStateService: SwapsStateService,
    private readonly depositService: DepositService,
    private readonly modalService: ModalService,
    private readonly tradePageService: TradePageService,
    private readonly headerStore: HeaderStore,
    private readonly targetNetworkAddressService: TargetNetworkAddressService
  ) {
    const depositStepParams: DepositStepParams = { active: true, loading: false, opened: true };
    const actionButtonsMap: Record<InputAddressesStepAction, ActionBtnState> = {
      confirm_addresses: {
        active: false,
        text: 'Confirm'
      },
      change_addresses: {
        active: false,
        text: 'Change Addresses'
      }
    };
    super(depositStepParams, _depositFormState$, _depositFormSteps$, actionButtonsMap);

    this._tradeState = { ...swapsStateService.tradeState };
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
    this.inputsForm.patchValue({ receiverAddr: this.targetNetworkAddressService.address });

    /**
     * hack to update button state after async validation of this.targetNetworkAddressService.address
     */
    setTimeout(() => this.validateInputs(), 10);

    const formStatusSub = this.inputsForm.statusChanges.subscribe(() => {
      this.validateInputs();
    });

    const tradeStatusSub = this.depositService.status$.subscribe(status => {
      if (status.status === CROSS_CHAIN_DEPOSIT_STATUS.WAITING) return;
      this._depositFormState$.next(
        status.status === CROSS_CHAIN_DEPOSIT_STATUS.FINISHED
          ? DEPOSIT_FORM_STATE.COMPLETED
          : DEPOSIT_FORM_STATE.STATUS_TRACKING
      );
    });

    this._subs.push(formStatusSub, tradeStatusSub);
  }

  public onDestroy(): void {
    this._subs.forEach(sub => sub.unsubscribe());
  }

  private validateInputs(): void {
    const receiverCtrl = this.inputsForm.controls.receiverAddr;
    const refundCtrl = this.inputsForm.controls.refundAddr;

    if (this.inputsForm.valid) {
      this.updateActionBtnState('confirm_addresses', {
        active: true,
        text: 'Confirm'
      });
    } else {
      if (receiverCtrl.invalid) {
        if (receiverCtrl.hasError('incorrectAddress')) {
          this.updateActionBtnState('confirm_addresses', {
            active: false,
            text: 'Invalid receiver address'
          });
        } else if (receiverCtrl.hasError('required')) {
          this.updateActionBtnState('confirm_addresses', {
            active: false,
            text: 'Enter receiver address'
          });
        }
      } else if (refundCtrl.invalid) {
        if (refundCtrl.hasError('incorrectAddress')) {
          this.updateActionBtnState('confirm_addresses', {
            active: false,
            text: 'Invalid refund address'
          });
        } else if (refundCtrl.hasError('required')) {
          this.updateActionBtnState('confirm_addresses', {
            active: false,
            text: 'Enter refund address'
          });
        }
      }
    }

    this.triggerStepsUpdate();
  }

  private async confirmAddresses(): Promise<void> {
    const receiverAddr = this.inputsForm.controls.receiverAddr.value;
    const refundAddr = this.inputsForm.controls.refundAddr.value;
    const tradeInfoStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.TRADE_INFO];
    const detailsStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS];

    this.setOpened(false);
    tradeInfoStep.setLoading(true);
    this.updateActionBtnState('confirm_addresses', { active: false });
    for (const ctrl in this.inputsForm.controls) {
      this.inputsForm.get(ctrl).disable();
    }
    this.triggerStepsUpdate();

    try {
      const selectedTrade = this._tradeState.trade as TransferTrade;
      const srcToken: TokenAmount = new TokenAmount(selectedTrade.from);
      const paymentInfo = await selectedTrade.getTransferTrade(receiverAddr, refundAddr);

      await this.depositService.updateTrade(paymentInfo, receiverAddr);
      if (!this.headerStore.isMobile) {
        await tradeInfoStep.createQrCodeCanvases(paymentInfo.depositAddress, srcToken);
      }
      this.depositService.setupUpdate();

      const dstTokenUpdated = new TokenAmount({
        ...detailsStep.depositDetails.dstToken.asStruct,
        tokenAmount: paymentInfo.toAmount
      });
      detailsStep.updateDepositDetails({ dstToken: dstTokenUpdated });

      tradeInfoStep.setLoading(false);
      this._depositFormState$.next(DEPOSIT_FORM_STATE.WAITING_FOR_SENDING_DEPOSIT);
    } catch {
      const backToForm = await this.modalService.openDepositTradeRateChangedModal(
        this._tradeState.tradeType as CrossChainTradeType
      );
      if (backToForm) {
        this.tradePageService.setState('form');
      } else {
        this._depositFormState$.next(DEPOSIT_FORM_STATE.IDLE);
      }
    }
  }

  private changeAddresses(): void {
    for (const ctrl in this.inputsForm.controls) {
      this.inputsForm.get(ctrl).enable();
    }
    this.depositService.cleanup();
    this._depositFormState$.next(DEPOSIT_FORM_STATE.IDLE);
  }

  public isRefundAddressRequired(): boolean {
    return isRefundAddressRequired(this._tradeState.tradeType);
  }

  private initValidators(): void {
    const detailsStep = this._depositFormSteps$.value[DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS];

    this.inputsForm.controls.receiverAddr.setAsyncValidators([
      isWalletAddressCorrect(detailsStep.depositDetails.dstToken.blockchain)
    ]);
    this.inputsForm.controls.refundAddr.setAsyncValidators([
      isWalletAddressCorrect(detailsStep.depositDetails.srcToken.blockchain)
    ]);
    if (this.isRefundAddressRequired()) {
      this.inputsForm.controls.refundAddr.addValidators([Validators.required]);
    }
    this.inputsForm.controls.refundAddr.hasValidator(Validators.required);
    this.inputsForm.updateValueAndValidity();
  }
}
