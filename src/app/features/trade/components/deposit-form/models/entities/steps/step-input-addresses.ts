import { FormControl, FormGroup, Validators } from '@angular/forms';
import { isWalletAddressCorrect } from '@app/features/privacy/providers/clearswap/constants/receiver-validator';
import { DepositStepWithAction } from '../abstracts/deposit-step-with-action';
import {
  DEPOSIT_STEP_NAME,
  DepositFormSteps,
  DepositStepName
} from '../../deposit-form-step-types';
import {
  ActionBtnState,
  DEPOSIT_FLOW,
  DepositStepParams,
  InputAddressesStepForm
} from '../../step-types';
import { DepositService } from '@app/features/trade/services/deposit/deposit.service';
import { BehaviorSubject, combineLatest, Subscription, takeWhile, tap } from 'rxjs';
import { DEPOSIT_STEP_ORDER } from '../../deposit-step-order';
import { ModalService } from '@app/core/modals/services/modal.service';
import { BlockchainsInfo, CrossChainTradeType, TokenAmount } from '@cryptorubic/core';
import { TradePageService } from '@app/features/trade/services/trade-page/trade-page.service';
import { InputAddressesStepAction } from '../../deposit-form-step-actions';
import { IWithHooks } from '../abstracts/interfaces';
import { DEPOSIT_FORM_STATE, DepositFormState } from '../../deposit-form-states';
import { SwapsStateService } from '@app/features/trade/services/swaps-state/swaps-state.service';
import { TransferTrade } from '../../deposit-form-info';
import { isRefundAddressRequired } from '@app/features/trade/services/refund-service/constants/refund-address-required-trade-types';
import { HeaderStore } from '@app/core/header/services/header.store';
import { TargetNetworkAddressService } from '@app/features/trade/services/target-network-address-service/target-network-address.service';
import { SelectedTrade } from '@app/features/trade/models/selected-trade';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';

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
    depositStepParams: DepositStepParams,
    actionButtonsMap: Record<InputAddressesStepAction, ActionBtnState>,
    _depositFormState$: BehaviorSubject<DepositFormState>,
    _depositFormSteps$: BehaviorSubject<DepositFormSteps>,
    swapsStateService: SwapsStateService,
    private readonly depositService: DepositService,
    private readonly modalService: ModalService,
    private readonly tradePageService: TradePageService,
    private readonly headerStore: HeaderStore,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
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

    const detailsStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS];

    const formStatusSub = combineLatest([
      this.inputsForm.statusChanges,
      detailsStep.depositFlow$
    ]).subscribe(() => this.validateInputs());

    const depositFlowSub = detailsStep.depositFlow$
      .pipe(
        tap(depositFlow => {
          const srcChain = this._tradeState.trade.from.blockchain;
          const dstChain = this._tradeState.trade.to.blockchain;
          const srcChainType = BlockchainsInfo.getChainType(srcChain);
          const dstChainType = BlockchainsInfo.getChainType(dstChain);
          const userChainType = this.walletConnectorService.chainType;

          const receiverAddr =
            srcChainType === dstChainType && srcChainType === userChainType
              ? this.targetNetworkAddressService.address || this.walletConnectorService.address
              : this.targetNetworkAddressService.address;

          this.inputsForm.patchValue({ receiverAddr });

          if (depositFlow === DEPOSIT_FLOW.TX) {
            const refundAddr = this.walletConnectorService.address || '';
            this.inputsForm.patchValue({ refundAddr });
          }
        }),
        takeWhile(depositFlow => depositFlow !== DEPOSIT_FLOW.TX)
      )
      .subscribe();

    this._subs.push(formStatusSub, depositFlowSub);
  }

  public onDestroy(): void {
    this._subs.forEach(sub => sub.unsubscribe());
  }

  private validateInputs(): void {
    if (this.inputsForm.disabled) return;

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

    tradeInfoStep.setLoading(true);
    this.updateActionBtnState('confirm_addresses', { active: false });
    this.inputsForm.disable();

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
    this._depositFormState$.next(DEPOSIT_FORM_STATE.INPUT_ADDRESSES);
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

    for (const ctrl in this.inputsForm.controls) {
      this.inputsForm.get(ctrl).updateValueAndValidity();
    }
  }
}
