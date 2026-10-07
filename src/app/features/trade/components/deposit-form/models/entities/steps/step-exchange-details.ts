import {
  DEPOSIT_STEP_NAME,
  DepositFormSteps,
  DepositStepName
} from '../../deposit-form-step-types';
import {
  ActionBtnState,
  DEPOSIT_FLOW,
  DepositFlow,
  DepositFormDetails,
  DepositStepParams
} from '../../step-types';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { DEPOSIT_FORM_STATE, DepositFormState } from '../../deposit-form-states';
import { DepositStepWithAction } from '../abstracts/deposit-step-with-action';
import { ExchangeDetailsStepAction } from '../../deposit-form-step-actions';
import { BlockchainsInfo } from '@cryptorubic/core';
import { NotSupportedNetworkForDepositError } from '@app/core/errors/models/provider/not-supported-network-for-deposit-error';
import { ErrorsService } from '@app/core/errors/errors.service';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { CHAIN_SUPPORTED_WALLETS } from '@app/core/services/wallets/constants/chaintype-supported-wallets';
import { WalletError } from '@app/core/errors/models/provider/wallet-error';
import { Injector } from '@angular/core';
import { ModalService } from '@app/core/modals/services/modal.service';
import { pairSupportsDepositFlowViaTxSign } from '../../../utils/pair-supports-tx-flow';

export class ExchangeDetailsStep extends DepositStepWithAction<ExchangeDetailsStepAction> {
  public readonly name: DepositStepName = DEPOSIT_STEP_NAME.EXCHANGE_DETAILS;

  private readonly _depositFlow$ = new BehaviorSubject<DepositFlow>(DEPOSIT_FLOW.MANUAL);

  public readonly depositFlow$ = this._depositFlow$.asObservable();

  public get depositFlow(): DepositFlow {
    return this._depositFlow$.value;
  }

  private readonly _depositDetails$: BehaviorSubject<DepositFormDetails>;

  public readonly depositDetails$: Observable<DepositFormDetails>;

  public get depositDetails(): DepositFormDetails {
    return this._depositDetails$.value;
  }

  constructor(
    depositStepParams: DepositStepParams,
    actionButtonsMap: Record<ExchangeDetailsStepAction, ActionBtnState>,
    _depositFormState$: BehaviorSubject<DepositFormState>,
    _depositFormSteps$: BehaviorSubject<DepositFormSteps>,
    depositDetails: DepositFormDetails,
    private readonly injector: Injector,
    private readonly errorsService: ErrorsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly modalService: ModalService
  ) {
    super(depositStepParams, _depositFormState$, _depositFormSteps$, actionButtonsMap);

    this._depositDetails$ = new BehaviorSubject(depositDetails);
    this.depositDetails$ = this._depositDetails$.asObservable();
  }

  public async doAction(action: ExchangeDetailsStepAction): Promise<void> {
    switch (action) {
      case 'select_manual_flow':
        this.updateActionBtnState('select_via_wallet', { invisible: true });
        this.updateActionBtnState('select_manual_flow', { invisible: true });

        this._depositFlow$.next(DEPOSIT_FLOW.MANUAL);
        this._depositFormState$.next(DEPOSIT_FORM_STATE.INPUT_ADDRESSES);
        break;
      case 'select_via_wallet':
        const srcChain = this.depositDetails.srcToken.blockchain;
        const srcChainType = BlockchainsInfo.getChainType(srcChain);

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

        this.updateActionBtnState('select_via_wallet', { invisible: true });
        this.updateActionBtnState('select_manual_flow', { invisible: true });

        this._depositFlow$.next(DEPOSIT_FLOW.TX);
        this._depositFormState$.next(DEPOSIT_FORM_STATE.WAITING_FOR_SIGNING_TRANSFER);
        break;
    }
  }

  public updateDepositDetails(newDepositDetails: Partial<DepositFormDetails>): void {
    this._depositDetails$.next({ ...this.depositDetails, ...newDepositDetails });
  }
}
