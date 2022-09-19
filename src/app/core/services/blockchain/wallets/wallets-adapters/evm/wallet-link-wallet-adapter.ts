import { BehaviorSubject } from 'rxjs';
import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import WalletLink, { WalletLinkProvider } from 'walletlink';
import { WalletLinkOptions } from 'walletlink/dist/WalletLink';
import { ErrorsService } from '@core/errors/errors.service';
import { AddEthChainParams } from '@shared/models/blockchain/add-eth-chain-params';
import { UndefinedError } from '@core/errors/models/undefined.error';
import BigNumber from 'bignumber.js';
import { RubicError } from '@core/errors/models/rubic-error';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { StoreService } from '@core/services/store/store.service';
import { WalletlinkError } from '@core/errors/models/provider/walletlink-error';
import { WalletlinkWrongNetwork } from '@core/errors/models/provider/walletlink-wrong-network';
import { NgZone } from '@angular/core';
import { CHAIN_TYPE } from 'rubic-sdk';
import { RubicWindow } from '@shared/utils/rubic-window';

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
    onNetworkChanges$: BehaviorSubject<BlockchainData>,
    errorService: ErrorsService,
    zone: NgZone,
    private readonly window: RubicWindow,
    private readonly storeService: StoreService,
    blockchainId: number
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorService, zone);

    this.wallet = this.getWallet(blockchainId);
  }

  public getWallet(chainId: number): WalletLinkProvider {
    if (!chainId) {
      console.error('Desktop walletLink works only with predefined chainId');
      throw new UndefinedError();
    }

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
    const chain = BlockchainsInfo.getBlockchainById(chainId);
    const walletLink = new WalletLink(defaultWalletParams);
    this.selectedChain = chainId.toString();
    return walletLink.makeWeb3Provider(chain.rpcList[0] as string, chainId);
  }

  public async activate(): Promise<void> {
    try {
      const [address] = await this.wallet.request<[string]>({ method: 'eth_requestAccounts' });

      const chainId = (await this.wallet.request({ method: 'eth_chainId' })) as string;
      const chainInfo = BlockchainsInfo.getBlockchainById(chainId);

      // in desktop version selected into modal chain should match mobile app selected chain
      if (!this.isMobileMode) {
        if (!new BigNumber(chainId).eq(this.selectedChain)) {
          throw new WalletlinkWrongNetwork(
            BlockchainsInfo.getBlockchainById(this.selectedChain).label
          );
        }
      }

      this.isEnabled = true;
      this.selectedAddress = address;
      this.selectedChain = chainInfo.id.toString();
      this.zone.run(() => {
        this.onNetworkChanges$.next(chainInfo);
        this.onAddressChanges$.next(address);
      });
      this.storeService.setItem('chainId', Number(chainInfo?.id));
    } catch (error) {
      if (error instanceof RubicError) {
        throw error;
      }
      throw new WalletlinkError();
    }
  }

  public async deActivate(): Promise<void> {
    this.isEnabled = false;
    this.wallet.close();
    this.onAddressChanges$.next(undefined);
    this.onNetworkChanges$.next(undefined);
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
