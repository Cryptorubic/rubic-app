import { BehaviorSubject } from 'rxjs';
import WalletLink, { WalletLinkProvider } from 'walletlink';
import { WalletLinkOptions } from 'walletlink/dist/WalletLink';
import { ErrorsService } from '@core/errors/errors.service';
import { AddEthChainParams } from '@core/services/blockchain/wallets/models/add-eth-chain-params';
import { UndefinedError } from '@core/errors/models/undefined.error';
import { RubicError } from '@core/errors/models/rubic-error';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { StoreService } from '@core/services/store/store.service';
import { WalletlinkError } from '@core/errors/models/provider/walletlink-error';
import { WalletlinkWrongNetwork } from '@core/errors/models/provider/walletlink-wrong-network';
import { NgZone } from '@angular/core';
import { BlockchainName, BlockchainsInfo, CHAIN_TYPE } from 'rubic-sdk';
import { RubicWindow } from '@shared/utils/rubic-window';
import { rpcList } from '@shared/constants/blockchain/rpc-list';

export class WalletLinkWalletAdapter extends CommonWalletAdapter<WalletLinkProvider> {
  public readonly walletType = CHAIN_TYPE.EVM;

  private isMobileMode: boolean = false;

  public get isMultiChainWallet(): boolean {
    return false;
  }

  public get walletName(): WALLET_NAME {
    return WALLET_NAME.WALLET_LINK;
  }

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorService: ErrorsService,
    zone: NgZone,
    private readonly window: RubicWindow,
    private readonly storeService: StoreService,
    chainId: number
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorService, zone);

    this.wallet = this.getWallet(chainId);
  }

  public getWallet(chainId: number): WalletLinkProvider {
    if (!chainId) {
      console.error('Desktop walletLink works only with predefined chainId');
      throw new UndefinedError();
    }

    this.selectedChain = BlockchainsInfo.getBlockchainNameById(chainId);

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
    const rpcUrl = rpcList[this.selectedChain as keyof typeof rpcList][0] as string; // @todo update
    return walletLink.makeWeb3Provider(rpcUrl, chainId);
  }

  public async activate(): Promise<void> {
    try {
      const [address] = await this.wallet.request<[string]>({ method: 'eth_requestAccounts' });
      const chainId = (await this.wallet.request({ method: 'eth_chainId' })) as string;
      this.isEnabled = true;

      const chainName = BlockchainsInfo.getBlockchainNameById(chainId);

      // in desktop version selected into modal chain should match mobile app selected chain
      if (!this.isMobileMode) {
        if (chainName !== this.selectedChain) {
          throw new WalletlinkWrongNetwork(this.selectedChain);
        }
      }

      this.selectedAddress = address;
      this.selectedChain = chainName;
      this.zone.run(() => {
        this.onAddressChanges$.next(address);
        this.onNetworkChanges$.next(this.selectedChain);
      });
      this.storeService.setItem('chainId', Number(chainId));
    } catch (error) {
      if (error instanceof RubicError) {
        throw error;
      }
      throw new WalletlinkError();
    }
  }

  public async deactivate(): Promise<void> {
    this.isEnabled = false;
    this.wallet.close();
    this.onAddressChanges$.next(undefined);
    this.onNetworkChanges$.next(undefined);
    this.storeService.deleteItem('chainId');
  }

  public async switchChain(chainId: string): Promise<null | never> {
    return this.wallet.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }]
    });
  }

  public async addChain(params: AddEthChainParams): Promise<null | never> {
    return this.wallet.request({
      method: 'wallet_addEthereumChain',
      params: [params]
    });
  }
}
