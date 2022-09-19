import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BLOCKCHAIN_NAME, BlockchainName, CHAIN_TYPE, compareAddresses } from 'rubic-sdk';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { NgZone } from '@angular/core';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { RubicWindow } from '@shared/utils/rubic-window';
import { RubicError } from '@core/errors/models/rubic-error';
import { mainnetNodes } from '@core/services/wallets/wallets-adapters/tron/constants/mainnet-nodes';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { filter } from 'rxjs/operators';

export class TronLinkAdapter extends CommonWalletAdapter {
  public readonly chainType = CHAIN_TYPE.TRON;

  public readonly walletName = WALLET_NAME.TRON_LINK;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    private readonly window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone);
    this.wallet = window.tronLink;
  }

  public async activate(): Promise<void> {
    const response = await this.wallet.request({ method: 'tron_requestAccounts' });
    if (response.code !== 200) {
      if (
        response.code === 4001 ||
        response.message?.toLowerCase().includes('user rejected the request')
      ) {
        throw new SignRejectError();
      }
      if (response === '') {
        throw new RubicError('Please, check you unlocked TronLink.'); // @todo add error
      }
      throw new Error(response.message);
    }
    this.isEnabled = true;

    this.selectedAddress = this.wallet.tronWeb.defaultAddress.base58;
    const node = this.wallet.tronWeb.fullNode?.host;
    this.selectedChain = mainnetNodes.some(mainnetNode => node.includes(mainnetNode))
      ? BLOCKCHAIN_NAME.TRON
      : null;
    this.onAddressChanges$.next(this.selectedAddress);
    this.onNetworkChanges$.next(this.selectedChain);
    this.initSubscriptionsOnChanges();
  }

  /**
   * Subscribes on chain and account change events.
   */
  protected initSubscriptionsOnChanges(): void {
    fromEvent(this.window, 'message')
      .pipe(filter((e: RubicAny) => e.data.message?.action === 'setAccount'))
      .subscribe((e: RubicAny) => {
        const address = e.data.message.data.address;
        if (!compareAddresses(address, this.selectedAddress)) {
          this.selectedAddress = address;
          this.zone.run(() => {
            this.onAddressChanges$.next(this.selectedAddress);
          });
        }
      });

    fromEvent(this.window, 'message')
      .pipe(filter((e: RubicAny) => e.data.message?.action === 'setNode'))
      .subscribe((e: RubicAny) => {
        const node = e.data.message.data.node.fullNode;
        const chain = mainnetNodes.some(mainnetNode => node.includes(mainnetNode))
          ? BLOCKCHAIN_NAME.TRON
          : null;
        if (chain !== this.selectedChain) {
          this.selectedChain = chain;
          this.zone.run(() => {
            this.onNetworkChanges$.next(this.selectedChain);
          });
        }
      });
  }

  public deactivate(): void {
    this.onAddressChanges$.next(null);
    this.onNetworkChanges$.next(null);
    this.isEnabled = false;
  }
}
