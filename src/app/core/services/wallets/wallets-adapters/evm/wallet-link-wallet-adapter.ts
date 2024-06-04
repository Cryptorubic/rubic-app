import { BehaviorSubject } from 'rxjs';
import WalletLink, { WalletLinkProvider } from 'walletlink';
import { WalletLinkOptions } from 'walletlink/dist/WalletLink';
import { ErrorsService } from '@core/errors/errors.service';
import { UndefinedError } from '@core/errors/models/undefined.error';
import { RubicError } from '@core/errors/models/rubic-error';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { StoreService } from '@core/services/store/store.service';
import { WalletlinkError } from '@core/errors/models/provider/walletlink-error';
import { NgZone } from '@angular/core';
import { BlockchainName, BlockchainsInfo, EvmBlockchainName } from 'rubic-sdk';
import { RubicWindow } from '@shared/utils/rubic-window';
import { rpcList } from '@shared/constants/blockchain/rpc-list';
import { EvmWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/common/evm-wallet-adapter';

export class WalletLinkWalletAdapter extends EvmWalletAdapter<WalletLinkProvider> {
  public readonly walletName = WALLET_NAME.WALLET_LINK;

  private isMobileMode: boolean = false;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorService: ErrorsService,
    zone: NgZone,
    window: RubicWindow,
    private readonly storeService: StoreService,
    chainId: number
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorService, zone, window);

    chainId = chainId ?? this.storeService.getItem('RUBIC_CHAIN_ID');
    this.wallet = this.getWallet(chainId);
  }

  public getWallet(chainId: number): WalletLinkProvider {
    if (!chainId) {
      console.error('Desktop walletLink works only with predefined chainId');
      throw new UndefinedError();
    }

    this.selectedChain = BlockchainsInfo.getBlockchainNameById(chainId) as EvmBlockchainName;
    const provider = this.window.ethereum as WalletLinkProvider;

    if (provider?.isCoinbaseWallet === true) {
      // Handle mobile coinbase browser.
      this.isMobileMode = true;
      return provider;
    }

    const defaultWalletParams: WalletLinkOptions = {
      appName: 'Rubic',
      appLogoUrl: 'https://rubic.exchange/assets/images/rubic-logo.svg',
      darkMode: false
    };
    const walletLink = new WalletLink(defaultWalletParams);
    const rpcUrl = rpcList[this.selectedChain][0];
    return walletLink.makeWeb3Provider(rpcUrl, chainId);
  }

  public async activate(): Promise<void> {
    try {
      const [address] = await this.wallet.request<[string]>({ method: 'eth_requestAccounts' });
      const chainId = (await this.wallet.request({ method: 'eth_chainId' })) as string;
      this.isEnabled = true;

      const chainName = BlockchainsInfo.getBlockchainNameById(chainId) as EvmBlockchainName;

      this.selectedAddress = address;
      this.selectedChain = chainName;
      this.zone.run(() => {
        this.onAddressChanges$.next(address);
        this.onNetworkChanges$.next(this.selectedChain);
      });
      this.storeService.setItem('RUBIC_CHAIN_ID', Number(chainId));
    } catch (error) {
      if (error instanceof RubicError) {
        throw error;
      }
      throw new WalletlinkError();
    }
  }

  public async deactivate(): Promise<void> {
    this.wallet.close();
    this.storeService.deleteItem('RUBIC_CHAIN_ID');
    super.deactivate();
  }
}
