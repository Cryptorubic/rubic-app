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
import { Injector } from '@angular/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { WalletError } from '@app/core/errors/models/provider/wallet-error';
import { BlockchainsInfo, TokenAmount } from '@cryptorubic/core';
import { NotSupportedNetworkForDepositError } from '@app/core/errors/models/provider/not-supported-network-for-deposit-error';
import { CHAIN_SUPPORTED_WALLETS } from '@app/core/services/wallets/constants/chaintype-supported-wallets';
import { QrCodeGenerator } from '../../../utils/qr-code-generator';
import { SelectedTrade } from '@app/features/trade/models/selected-trade';
import { IWithHooks } from '../abstracts/interfaces';
import { TransferTrade } from '../../deposit-form-info';
import { DepositService } from '@app/features/trade/services/deposit/deposit.service';
import { CrossChainTradeType } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { TradePageService } from '@app/features/trade/services/trade-page/trade-page.service';

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
    private readonly injector: Injector,
    swapsStateService: SwapsStateService,
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
    const walletSub = combineLatest([
      this.walletConnectorService.addressChange$,
      this.walletConnectorService.networkChange$
    ]).subscribe(([userAddr, userChain]) => {
      const srcTokenChain = this._tradeState.trade.from.blockchain;
      const srcChainType = BlockchainsInfo.getChainType(srcTokenChain);
      const userChainType = BlockchainsInfo.getChainType(userChain);

      if (userAddr && srcChainType === userChainType) {
        this.updateActionBtnState('send_via_wallet', { active: true, text: 'Send' });
      } else {
        this.updateActionBtnState('send_via_wallet', {
          active: true,
          text: 'Connect Wallet & Send'
        });
      }

      this.triggerStepsUpdate();
    });

    this._subs.push(walletSub);
  }

  public onDestroy(): void {
    this._subs.forEach(sub => sub.unsubscribe());
  }

  public async createQrCodeCanvases(
    targetWalletAddr: string,
    srcToken: TokenAmount
  ): Promise<void> {
    const srcChain = this._tradeState.trade.from.blockchain;
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

    if (!BlockchainsInfo.isEvmBlockchainName(srcChain)) {
      this.errorsService.catch(new NotSupportedNetworkForDepositError(srcChain));
      return;
    }

    inputAddrStep.setActive(false);
    inputAddrStep.setOpened(false);

    this.updateActionBtnState('send_via_wallet', { active: false, loading: true });
    this.triggerStepsUpdate();

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
        this.updateActionBtnState('send_via_wallet', { active: true, loading: false });
        inputAddrStep.setActive(true);
        this.triggerStepsUpdate();
        this.errorsService.catch(new WalletError());
        return;
      }
    }

    if (this.walletConnectorService.network !== srcChain) {
      const switched = await this.walletConnectorService.switchChain(srcChain);
      if (!switched) {
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

    try {
      const selectedTrade = this._tradeState.trade as TransferTrade;
      const paymentInfo = await selectedTrade.getTransferTrade(receiverAddress, refundAddress);

      await this.depositService.updateTrade(paymentInfo, receiverAddress);

      await this.swapsControllerService.swap(
        this._tradeState,
        true,
        {
          onSwap: () => {
            tradeStatusStep.setActive(true);
            tradeStatusStep.setOpened(true);

            this.setOpened(false);
            this.updateActionBtnState('send_via_wallet', { loading: false });

            this.depositService.setupUpdate();
            this._depositFormState$.next(DEPOSIT_FORM_STATE.STATUS_TRACKING);
            this.triggerStepsUpdate();
          },
          onError: () => {
            inputAddrStep.setActive(true);

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
