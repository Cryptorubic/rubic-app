import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  CHAIN_TYPE,
  compareAddresses,
  TronBlockchainName
} from '@cryptorubic/core';
import { BehaviorSubject, from, fromEvent } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { NgZone } from '@angular/core';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { RubicWindow } from '@shared/utils/rubic-window';
import { RubicError } from '@core/errors/models/rubic-error';
import { mainnetNodes } from '@core/services/wallets/wallets-adapters/tron/constants/mainnet-nodes';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { filter, map } from 'rxjs/operators';
import { switchTap } from '@shared/utils/utils';
import { AddEvmChainParams } from '@core/services/wallets/models/add-evm-chain-params';

export class TronLinkAdapter extends CommonWalletAdapter {
  public readonly chainType = CHAIN_TYPE.TRON;

  public readonly walletName = WALLET_NAME.TRON_LINK;

  protected selectedChain: TronBlockchainName | null;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
  }

  public async activate(): Promise<void> {
    await this.connectToWallet();
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

  private async connectToWallet(): Promise<void> {
    const provider = this.window.tronLink;
    if (provider?.isBitKeepChrome) {
      throw new RubicError('Please, check you unlocked TronLink.');
    }
    this.wallet = provider;
    const response = await this.wallet.request({ method: 'tron_requestAccounts' });
    if (response.code !== 200) {
      if (
        response.code === 4001 ||
        response.message?.toLowerCase().includes('user rejected the request')
      ) {
        throw new SignRejectError();
      }
      if (response === '') {
        throw new RubicError('Please, check you unlocked TronLink.');
      }
      throw new Error(response.message);
    }
  }

  /**
   * Subscribes on chain and account change events.
   */
  protected initSubscriptionsOnChanges(): void {
    this.onAddressChangesSub = fromEvent(this.window, 'message')
      .pipe(
        filter((event: RubicAny) => event.data.message?.action === 'setAccount'),
        map((event: RubicAny) => event.data.message.data.address),
        filter(address => !compareAddresses(address, this.selectedAddress)),
        switchTap(() => from(this.connectToWallet()))
      )
      .subscribe((address: string) => {
        this.selectedAddress = address;
        this.zone.run(() => {
          this.onAddressChanges$.next(this.selectedAddress);
        });
      });

    this.onNetworkChangesSub = fromEvent(this.window, 'message')
      .pipe(
        filter((event: RubicAny) => event.data.message?.action === 'setNode'),
        map((event: RubicAny) => {
          const node = event.data.message.data.node.fullNode;
          return mainnetNodes.some(mainnetNode => node.includes(mainnetNode))
            ? BLOCKCHAIN_NAME.TRON
            : null;
        }),
        filter(chain => chain !== this.selectedChain)
      )
      .subscribe((chain: TronBlockchainName | null) => {
        this.selectedChain = chain;
        this.zone.run(() => {
          this.onNetworkChanges$.next(this.selectedChain);
        });
      });
  }

  public async switchChain(_chainId: string): Promise<void | never> {
    throw new Error('Method is not supported by wallet');
  }

  public async addChain(_params: AddEvmChainParams): Promise<void | never> {
    throw new Error('Method is not supported by wallet');
  }
}
