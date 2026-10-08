import { BehaviorSubject, combineLatest, firstValueFrom, Subscription } from 'rxjs';
import {
  DEPOSIT_STEP_NAME,
  DepositFormSteps,
  DepositStepName
} from '../../deposit-form-step-types';
import { ActionBtnState, DepositStepParams, QrCodesType } from '../../step-types';
import { DepositStepWithAction } from '../abstracts/deposit-step-with-action';
import { DEPOSIT_STEP_ORDER } from '../../deposit-step-order';
import { TradeInfoStepAction } from '../../deposit-form-step-actions';
import { DEPOSIT_FORM_STATE, DepositFormState } from '../../deposit-form-states';
import { SwapsStateService } from '@app/features/trade/services/swaps-state/swaps-state.service';
import { SwapsControllerService } from '@app/features/trade/services/swaps-controller/swaps-controller.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { ModalService } from '@app/core/modals/services/modal.service';
import { ErrorsService } from '@app/core/errors/errors.service';
import { BlockchainsInfo, TokenAmount } from '@cryptorubic/core';
import { NotSupportedNetworkForDepositError } from '@app/core/errors/models/provider/not-supported-network-for-deposit-error';
import { QrCodeGenerator } from '../../../utils/qr-code-generator';
import { SelectedTrade } from '@app/features/trade/models/selected-trade';
import { IWithHooks } from '../abstracts/interfaces';
import { TransferTrade } from '../../deposit-form-info';
import { DepositService } from '@app/features/trade/services/deposit/deposit.service';
import { CrossChainTradeType } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { TradePageService } from '@app/features/trade/services/trade-page/trade-page.service';
import { pairSupportsDepositFlowViaTxSign } from '../../../utils/pair-supports-tx-flow';
import { CHAIN_SUPPORTED_WALLETS } from '@app/core/services/wallets/constants/chaintype-supported-wallets';
import { WalletError } from '@app/core/errors/models/provider/wallet-error';
import { Injector } from '@angular/core';
import { ReceiverRequiredError } from '@app/core/errors/models/provider/receiver-required-error';

export class TradeInfoStep
  extends DepositStepWithAction<TradeInfoStepAction>
  implements IWithHooks
{
  public readonly name: DepositStepName = DEPOSIT_STEP_NAME.TRADE_INFO;

  private _qrCodeCanvases: QrCodesType | null = null;

  public get qrCodeCanvases(): QrCodesType | null {
    return this._qrCodeCanvases;
  }

  /**
   * makes shallow copy of swapsStateService.tradeState because it reassigns new trade every 60 secs on recalculation
   */
  private readonly _tradeState: SelectedTrade;

  private readonly _subs: Subscription[] = [];

  constructor(
    depositStepParams: DepositStepParams,
    actionButtonsMap: Record<TradeInfoStepAction, ActionBtnState>,
    _depositFormState$: BehaviorSubject<DepositFormState>,
    _depositFormSteps$: BehaviorSubject<DepositFormSteps>,
    swapsStateService: SwapsStateService,
    private readonly injector: Injector,
    private readonly swapsControllerService: SwapsControllerService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly modalService: ModalService,
    private readonly errorsService: ErrorsService,
    private readonly depositService: DepositService,
    private readonly tradePageService: TradePageService
  ) {
    super(depositStepParams, _depositFormState$, _depositFormSteps$, actionButtonsMap);

    this._tradeState = { ...swapsStateService.tradeState };
  }

  public onInit(): void {
    const detailsStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS];
    const inputAddrStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.INPUT_ADDRESSES];

    const formStatusSub = combineLatest([
      inputAddrStep.inputsForm.statusChanges,
      detailsStep.depositFlow$
    ]).subscribe(() => this.validateInputs());

    this._subs.push(formStatusSub);
  }

  public onDestroy(): void {
    this._subs.forEach(sub => sub.unsubscribe());
  }

  private validateInputs(): void {
    const inputAddrStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.INPUT_ADDRESSES];
    if (inputAddrStep.inputsForm.disabled) return;

    const receiverCtrl = inputAddrStep.inputsForm.controls.receiverAddr;
    const refundCtrl = inputAddrStep.inputsForm.controls.refundAddr;

    if (inputAddrStep.inputsForm.valid) {
      this.updateActionBtnState('send_via_wallet', {
        active: true,
        text: 'Continue in Wallet'
      });
    } else {
      if (receiverCtrl.invalid) {
        if (receiverCtrl.hasError('incorrectAddress')) {
          this.updateActionBtnState('send_via_wallet', {
            active: false,
            text: 'Invalid receiver address'
          });
        } else if (receiverCtrl.hasError('required')) {
          this.updateActionBtnState('send_via_wallet', {
            active: false,
            text: 'Enter receiver address'
          });
        }
      } else if (refundCtrl.invalid) {
        if (refundCtrl.hasError('incorrectAddress')) {
          this.updateActionBtnState('send_via_wallet', {
            active: false,
            text: 'Invalid refund address'
          });
        } else if (refundCtrl.hasError('required')) {
          this.updateActionBtnState('send_via_wallet', {
            active: false,
            text: 'Enter refund address'
          });
        }
      }
    }

    this.triggerStepsUpdate();
  }

  public async createQrCodeCanvases(
    targetWalletAddr: string,
    srcToken: TokenAmount
  ): Promise<void> {
    const srcChain = this._tradeState.trade.from.blockchain;
    const receiverOnlyQR = await QrCodeGenerator.generateTransferQrCode(
      srcChain,
      targetWalletAddr,
      { token: srcToken, size: 170, qrContent: 'receiver' }
    );
    this._qrCodeCanvases = {
      receiverOnly: receiverOnlyQR,
      receiverWithAmount: null
    };
  }

  public async doAction(action: TradeInfoStepAction): Promise<void> {
    switch (action) {
      case 'confirm_deposit':
        return this.confirmDeposit();
      case 'send_via_wallet':
        return this.sendTransferViaWallet();
    }
  }

  private async confirmDeposit(): Promise<void> {
    const inputAddrStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.INPUT_ADDRESSES];
    const tradeStatusStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.TRADE_STATUS];

    inputAddrStep.setActive(false);
    inputAddrStep.setOpened(false);

    tradeStatusStep.setActive(true);
    tradeStatusStep.setOpened(true);

    this.setOpened(false);
    this.updateActionBtnState('confirm_deposit', { active: false });

    this._depositFormState$.next(DEPOSIT_FORM_STATE.STATUS_TRACKING);
  }

  private async sendTransferViaWallet(): Promise<void> {
    const srcChain = this._tradeState.trade.from.blockchain;
    const srcChainType = BlockchainsInfo.getChainType(srcChain);
    const inputAddrStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.INPUT_ADDRESSES];
    const tradeStatusStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.TRADE_STATUS];

    if (!pairSupportsDepositFlowViaTxSign(srcChain)) {
      this.errorsService.catch(new NotSupportedNetworkForDepositError(srcChain));
      return;
    }

    if (
      !this.walletConnectorService.address ||
      this.walletConnectorService.chainType !== srcChainType
    ) {
      try {
        await firstValueFrom(
          this.modalService.openWalletModal(this.injector, {
            direction: 'row',
            providers: CHAIN_SUPPORTED_WALLETS[srcChainType]
          })
        );
        if (this.walletConnectorService.chainType !== srcChainType) {
          throw new WalletError();
        }
      } catch {
        this.errorsService.catch(new WalletError());
        return;
      }
    }

    inputAddrStep.setActive(false);
    inputAddrStep.setOpened(false);

    this.updateActionBtnState('send_via_wallet', { active: false, loading: true });
    this.triggerStepsUpdate();

    if (
      this.walletConnectorService.network !== srcChain &&
      BlockchainsInfo.isEvmBlockchainName(srcChain)
    ) {
      const switched = await this.walletConnectorService.switchChain(srcChain);
      if (!switched) {
        inputAddrStep.setActive(true);
        inputAddrStep.setOpened(true);

        this.updateActionBtnState('send_via_wallet', { active: true, loading: false });
        this.triggerStepsUpdate();
        return;
      }
    }

    const receiverAddress =
      inputAddrStep.inputsForm.controls.receiverAddr.value.trim() ||
      this.walletConnectorService.address;
    const refundAddress =
      inputAddrStep.inputsForm.controls.refundAddr.value.trim() ||
      this.walletConnectorService.address;

    if (!receiverAddress) {
      inputAddrStep.setActive(true);
      inputAddrStep.setOpened(true);

      inputAddrStep.inputsForm.controls.receiverAddr.markAsDirty();
      inputAddrStep.inputsForm.controls.receiverAddr.updateValueAndValidity();

      this.updateActionBtnState('send_via_wallet', { active: true, loading: false });
      this.triggerStepsUpdate();

      this.errorsService.catch(new ReceiverRequiredError());
      return;
    }

    try {
      const selectedTrade = this._tradeState.trade as TransferTrade;
      const paymentInfo = await selectedTrade.getTransferTrade(receiverAddress, refundAddress);

      await this.depositService.updateTrade(paymentInfo, receiverAddress);

      await this.swapsControllerService.swap(
        this._tradeState,
        true,
        {
          onSwap: () => {
            this.setOpened(false);
            this.setActive(false);

            tradeStatusStep.setActive(true);
            tradeStatusStep.setOpened(true);

            this.depositService.setupUpdate();
            this._depositFormState$.next(DEPOSIT_FORM_STATE.STATUS_TRACKING);

            this.triggerStepsUpdate();
          },
          onError: () => {
            inputAddrStep.setActive(true);
            inputAddrStep.setOpened(true);

            this.updateActionBtnState('send_via_wallet', { active: true, loading: false });
            this.triggerStepsUpdate();
          }
        },
        {
          receiverAddress,
          refundAddress,
          useCacheData: true, // needs to reuse same deposit address from previous /swap response
          skipAmountCheck: false
        }
      );
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
}
