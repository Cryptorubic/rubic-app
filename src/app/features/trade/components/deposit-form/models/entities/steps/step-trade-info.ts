import { BehaviorSubject, firstValueFrom } from 'rxjs';
import {
  DEPOSIT_STEP_NAME,
  DepositFormSteps,
  DepositStepName
} from '../../deposit-form-step-types';
import { ActionBtnState, DepositStepParams } from '../../step-types';
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
import { BlockchainsInfo } from '@cryptorubic/core';
import { NotSupportedNetworkForDepositError } from '@app/core/errors/models/provider/not-supported-network-for-deposit-error';
import { CHAIN_SUPPORTED_WALLETS } from '@app/core/services/wallets/constants/chaintype-supported-wallets';

export class TradeInfoStep extends DepositStepWithAction<TradeInfoStepAction> {
  public readonly name: DepositStepName = DEPOSIT_STEP_NAME.TRADE_INFO;

  constructor(
    _depositFormState$: BehaviorSubject<DepositFormState>,
    _depositFormSteps$: BehaviorSubject<DepositFormSteps>,
    private readonly injector: Injector,
    private readonly swapsStateService: SwapsStateService,
    private readonly swapsControllerService: SwapsControllerService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly modalService: ModalService,
    private readonly errorsService: ErrorsService
  ) {
    const depositStepParams: DepositStepParams = { active: false, loading: false, opened: false };
    const actionButtonsMap: Record<TradeInfoStepAction, ActionBtnState> = {
      confirm_deposit: { active: true, text: 'Translated funds is done' },
      send_via_wallet: { active: true, text: 'Connect Wallet & Send' }
    };
    super(depositStepParams, _depositFormState$, _depositFormSteps$, actionButtonsMap);
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
    const srcChain = this.swapsStateService.tradeState.trade.from.blockchain;
    const srcChainType = BlockchainsInfo.getChainType(srcChain);
    const inputAddrStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.INPUT_ADDRESSES];
    const tradeStatusStep = this.depositFormSteps[DEPOSIT_STEP_ORDER.TRADE_STATUS];

    this.updateActionBtnState('confirm_deposit', { active: false });
    this.updateActionBtnState('send_via_wallet', { active: false });

    inputAddrStep.setActive(false);
    inputAddrStep.setOpened(false);

    if (!BlockchainsInfo.isEvmBlockchainName(srcChain)) {
      this.errorsService.catch(new NotSupportedNetworkForDepositError(srcChain));
      return;
    }
    if (!this.walletConnectorService.address) {
      await firstValueFrom(
        this.modalService.openWalletModal(this.injector, {
          direction: 'row',
          providers: CHAIN_SUPPORTED_WALLETS[srcChainType]
        })
      );
    }
    if (!this.walletConnectorService.address) {
      this.updateActionBtnState('confirm_deposit', { active: true });
      this.updateActionBtnState('send_via_wallet', { active: true });
      this.errorsService.catch(new WalletError());
      return;
    }

    if (this.walletConnectorService.network !== BlockchainsInfo.getChainType(srcChain)) {
      const switched = await this.walletConnectorService.switchChain(srcChain);
      if (!switched) {
        this.updateActionBtnState('confirm_deposit', { active: true });
        this.updateActionBtnState('send_via_wallet', { active: true });
        return;
      }
    }

    await this.swapsControllerService.swap(this.swapsStateService.tradeState, true, {
      onSwap: () => {
        tradeStatusStep.setActive(true);
        tradeStatusStep.setOpened(true);

        this.setOpened(false);
        this._depositFormState$.next(DEPOSIT_FORM_STATE.STATUS_TRACKING);
      },
      onError: err => {
        // @TODO_3003 use DEPOSIT_FORM_STATE.ERROR
        this._depositFormState$.next(DEPOSIT_FORM_STATE.EXPIRED);
        this.errorsService.catch(err);
        this.depositFormSteps.forEach(step => {
          step.setActive(false);
          step.setOpened(false);
          step.setLoading(false);
        });
      }
    });
  }
}
