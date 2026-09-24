import { BehaviorSubject, firstValueFrom } from 'rxjs';
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
import { Injector } from '@angular/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { WalletError } from '@app/core/errors/models/provider/wallet-error';
import { BlockchainsInfo, TokenAmount } from '@cryptorubic/core';
import { NotSupportedNetworkForDepositError } from '@app/core/errors/models/provider/not-supported-network-for-deposit-error';
import { CHAIN_SUPPORTED_WALLETS } from '@app/core/services/wallets/constants/chaintype-supported-wallets';
import { chainSupportsQrWithAmount } from '../../../utils/qr-supports';
import { QrCodeGenerator } from '../../../utils/qr-code-generator';
import { SelectedTrade } from '@app/features/trade/models/selected-trade';

export class TradeInfoStep extends DepositStepWithAction<TradeInfoStepAction> {
  public readonly name: DepositStepName = DEPOSIT_STEP_NAME.TRADE_INFO;

  private _qrCodeCanvases: QrCodesType | null = null;

  public get qrCodeCanvases(): QrCodesType | null {
    return this._qrCodeCanvases;
  }

  /**
   * makes shallow copy of swapsStateService.tradeState because it reassigns new trade every 60 secs on recalculation
   */
  private readonly _tradeState: SelectedTrade;

  constructor(
    _depositFormState$: BehaviorSubject<DepositFormState>,
    _depositFormSteps$: BehaviorSubject<DepositFormSteps>,
    private readonly injector: Injector,
    swapsStateService: SwapsStateService,
    private readonly swapsControllerService: SwapsControllerService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly modalService: ModalService,
    private readonly errorsService: ErrorsService
  ) {
    const depositStepParams: DepositStepParams = { active: false, loading: false, opened: false };

    const srcChain = swapsStateService.tradeState.trade.from.blockchain;
    let sendViaWalletBtnText: string = '';
    if (!walletConnectorService.network) {
      sendViaWalletBtnText = 'Connect Wallet & Send';
    } else if (srcChain !== walletConnectorService.network) {
      sendViaWalletBtnText = 'Change Wallet & Send';
    } else {
      sendViaWalletBtnText = 'Send';
    }

    const actionButtonsMap: Record<TradeInfoStepAction, ActionBtnState> = {
      confirm_deposit: { active: true, text: 'Deposit sent' },
      send_via_wallet: { active: true, text: sendViaWalletBtnText }
    };
    super(depositStepParams, _depositFormState$, _depositFormSteps$, actionButtonsMap);

    this._tradeState = { ...swapsStateService.tradeState };
  }

  public async createQrCodeCanvases(
    targetWalletAddr: string,
    srcToken: TokenAmount
  ): Promise<void> {
    const srcChain = this._tradeState.trade.from.blockchain;
    if (chainSupportsQrWithAmount(srcChain)) {
      const [receiverOnlyQR, receiverWithAmountQR] = await Promise.all([
        QrCodeGenerator.generateTransferQrCode(srcChain, targetWalletAddr, {
          token: srcToken,
          size: 142,
          qrContent: 'receiver'
        }),
        QrCodeGenerator.generateTransferQrCode(srcChain, targetWalletAddr, {
          size: 142,
          token: srcToken,
          qrContent: 'receiver+amount'
        })
      ]);
      this._qrCodeCanvases = {
        receiverOnly: receiverOnlyQR,
        receiverWithAmount: receiverWithAmountQR
      };
    } else {
      const receiverOnlyQR = await QrCodeGenerator.generateTransferQrCode(
        srcChain,
        targetWalletAddr,
        { token: srcToken, size: 142, qrContent: 'receiver' }
      );
      this._qrCodeCanvases = {
        receiverOnly: receiverOnlyQR,
        receiverWithAmount: null
      };
    }
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

    this.updateActionBtnState('confirm_deposit', { active: false });
    this.updateActionBtnState('send_via_wallet', { active: false });
    inputAddrStep.setActive(false);
    inputAddrStep.setOpened(false);
    this.triggerStepsUpdate();

    if (!BlockchainsInfo.isEvmBlockchainName(srcChain)) {
      this.errorsService.catch(new NotSupportedNetworkForDepositError(srcChain));
      return;
    }
    if (!this.walletConnectorService.address) {
      try {
        await firstValueFrom(
          this.modalService.openWalletModal(this.injector, {
            direction: 'row',
            providers: CHAIN_SUPPORTED_WALLETS[srcChainType]
          })
        );
      } catch {
        this.updateActionBtnState('confirm_deposit', { active: true });
        this.updateActionBtnState('send_via_wallet', { active: true });
        this.triggerStepsUpdate();
        this.errorsService.catch(new WalletError());
        return;
      }
    }

    if (this.walletConnectorService.network !== BlockchainsInfo.getChainType(srcChain)) {
      const switched = await this.walletConnectorService.switchChain(srcChain);
      if (!switched) {
        this.updateActionBtnState('confirm_deposit', { active: true });
        this.updateActionBtnState('send_via_wallet', {
          active: true,
          text: 'Change Wallet & Send'
        });
        this.triggerStepsUpdate();
        return;
      }
    }

    const receiverAddress = inputAddrStep.inputsForm.controls.receiverAddr.value.trim();
    const refundAddress = inputAddrStep.inputsForm.controls.refundAddr.value.trim();

    await this.swapsControllerService.swap(
      this._tradeState,
      true,
      {
        onSwap: () => {
          tradeStatusStep.setActive(true);
          tradeStatusStep.setOpened(true);
          this.setOpened(false);
          this._depositFormState$.next(DEPOSIT_FORM_STATE.STATUS_TRACKING);
          this.triggerStepsUpdate();
        },
        onError: () => {
          for (const ctrl in inputAddrStep.inputsForm.controls) {
            inputAddrStep.inputsForm.get(ctrl).enable();
          }
          inputAddrStep.updateActionBtnState('confirm_addresses', { active: true });
          this._depositFormState$.next(DEPOSIT_FORM_STATE.IDLE);
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
  }
}
