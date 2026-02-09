import { Inject, Injectable, Injector } from '@angular/core';
import { combineLatestWith, debounceTime, map, share, startWith } from 'rxjs/operators';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { ModalService } from '@core/modals/services/modal.service';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { SelectedTrade } from '@features/trade/models/selected-trade';
import { FormsTogglerService } from '../forms-toggler/forms-toggler.service';
import { BlockchainsInfo } from '@cryptorubic/core';
import { CrossChainTransferTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/cross-chain-transfer-trade';

type StateOptions = [SelectedTrade, boolean, boolean, string, boolean, boolean, string];

@Injectable()
export class ActionButtonService {
  public readonly buttonState$ = this.tradeState.tradeState$
    .pipe(
      combineLatestWith([
        this.tradeState.wrongBlockchain$,
        this.tradeState.notEnoughBalance$,
        this.walletConnector.addressChange$,
        this.targetNetworkAddressService.isAddressValid$,
        this.targetNetworkAddressService.isAddressRequired$,
        this.targetNetworkAddressService.address$,
        this.formsTogglerService.selectedForm$
      ])
    )
    .pipe(
      debounceTime(10),
      startWith(this.getDefaultParams()),
      share(),
      map((params: StateOptions) => this.getState(...params))
    );

  constructor(
    private readonly tradeState: SwapsStateService,
    private readonly walletConnector: WalletConnectorService,
    private readonly tradePageService: TradePageService,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly formsTogglerService: FormsTogglerService
  ) {}

  private swap(): void {
    this.tradePageService.setState('preview');
  }

  private deposit(): void {
    this.tradePageService.setState('depositPreview');
  }

  private connectWallet(): void {
    this.modalService.openWalletModal(this.injector).subscribe();
  }

  private getState(
    currentTrade: SelectedTrade,
    wrongBlockchain: boolean,
    notEnoughBalance: boolean,
    address: string,
    isReceiverValid: boolean,
    isAddressRequired: boolean,
    receiverAddress: string
  ): {
    type: 'error' | 'action';
    text: string;
    action: () => void;
  } {
    if (!currentTrade) {
      return {
        type: 'error',
        text: 'Select tokens',
        action: () => {}
      };
    }
    const isTransferFromNonEvm =
      currentTrade.trade instanceof CrossChainTransferTrade &&
      !BlockchainsInfo.isEvmBlockchainName(currentTrade.trade.from.blockchain);

    if (currentTrade.error) {
      return {
        type: 'error',
        text: this.getShortErrorMessage(currentTrade.error.message),
        action: () => {}
      };
    }

    if (!address && !isTransferFromNonEvm) {
      return {
        type: 'action',
        text: 'Connect wallet',
        action: this.connectWallet.bind(this)
      };
    }
    if (notEnoughBalance) {
      return {
        type: 'error',
        text: 'Insufficient balance',
        action: () => {}
      };
    }

    if (
      currentTrade.status === TRADE_STATUS.READY_TO_SWAP ||
      currentTrade.status === TRADE_STATUS.READY_TO_APPROVE ||
      (currentTrade.trade && wrongBlockchain)
    ) {
      // Handle Non EVM trade
      if (isAddressRequired) {
        const trulyAddress = Boolean(receiverAddress);

        if (isReceiverValid && trulyAddress) {
          if (isTransferFromNonEvm) {
            return {
              type: 'action',
              text: 'Preview swap',
              action: this.deposit.bind(this)
            };
          }
          return {
            type: 'action',
            text: 'Preview swap',
            action: this.swap.bind(this)
          };
        }
        return {
          type: 'error',
          text: 'Enter receiver address',
          action: () => {}
        };
      } else {
        if (!isReceiverValid) {
          return {
            type: 'error',
            text: 'Enter correct receiver address',
            action: () => {}
          };
        }
        return {
          type: 'action',
          text: 'Preview swap',
          action: this.swap.bind(this)
        };
      }
    }
    if (currentTrade.status === TRADE_STATUS.LOADING) {
      return {
        type: 'error',
        text: 'Calculating',
        action: () => {}
      };
    }
    if (currentTrade.status === TRADE_STATUS.NOT_INITIATED) {
      return {
        type: 'error',
        text: 'Select tokens',
        action: () => {}
      };
    }
    return {
      type: 'error',
      text: 'Trade is not available',
      action: () => {}
    };
  }

  private getShortErrorMessage(errorMessage: string): string {
    if (errorMessage.toLowerCase().includes('trustline not detected'))
      return 'Will be available soon';

    return errorMessage;
  }

  private getDefaultParams(): [SelectedTrade, boolean, boolean, string, boolean, boolean, string] {
    return [null, false, false, '', true, false, ''];
  }
}
