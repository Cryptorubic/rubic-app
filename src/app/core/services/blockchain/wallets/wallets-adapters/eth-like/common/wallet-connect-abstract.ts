import { BehaviorSubject } from 'rxjs';
import { IBlockchain } from '@shared/models/blockchain/IBlockchain';
import { NetworkError } from '@core/errors/models/provider/NetworkError';
import { WalletlinkError } from '@core/errors/models/provider/WalletlinkError';
import WalletConnect from '@walletconnect/web3-provider';
import { ErrorsService } from '@core/errors/errors.service';
import { WalletconnectError } from '@core/errors/models/provider/WalletconnectError';
import { Token } from '@shared/models/tokens/Token';
import { AddEthChainParams } from '@shared/models/blockchain/add-eth-chain-params';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/providers';
import Web3 from 'web3';
import networks from '@shared/constants/blockchain/networks';
import { IWalletConnectProviderOptions } from '@walletconnect/types';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/eth-like/common/common-wallet-adapter';

export abstract class WalletConnectAbstractAdapter extends CommonWalletAdapter {
  protected isEnabled: boolean;

  protected core: WalletConnect;

  protected selectedAddress: string;

  protected selectedChain: string;

  protected readonly onAddressChanges$: BehaviorSubject<string>;

  protected readonly onNetworkChanges$: BehaviorSubject<IBlockchain>;

  get walletType(): 'ethLike' | 'solana' {
    return 'ethLike';
  }

  get isInstalled(): boolean {
    return !!this.core;
  }

  get isMultiChainWallet(): boolean {
    const multiChainWalletNames = ['Trust Wallet Android', 'Trust Wallet'];
    const walletName = this.core.connector.peerMeta.name;
    return multiChainWalletNames.includes(walletName);
  }

  get isActive(): boolean {
    return this.isEnabled && this.core?.accounts.length > 0;
  }

  public get address(): string {
    return this.selectedAddress;
  }

  protected constructor(
    web3: Web3,
    chainChange$: BehaviorSubject<IBlockchain>,
    accountChange$: BehaviorSubject<string>,
    errorsService: ErrorsService,
    providerConfig: IWalletConnectProviderOptions
  ) {
    super(errorsService, accountChange$, chainChange$);
    this.isEnabled = false;
    this.core = new WalletConnect({
      rpc: this.getNetworksProviders(),
      ...providerConfig
    });
    // eslint-disable-next-line
    web3.setProvider(this.core as any);
    this.initSubscriptions();
  }

  private initSubscriptions(): void {
    this.core.on('chainChanged', (chain: string) => {
      this.selectedChain = chain;
      if (this.isEnabled) {
        this.onNetworkChanges$.next(BlockchainsInfo.getBlockchainById(chain));
        console.info('Chain changed', chain);
      }
    });
    this.core.on('accountsChanged', (accounts: string[]) => {
      this.selectedAddress = accounts[0] || null;
      if (this.isEnabled) {
        this.onAddressChanges$.next(this.selectedAddress);
        console.info('Selected account changed to', accounts[0]);
      }
    });
  }

  /**
   * Gets RPC links for app networks.
   */
  protected getNetworksProviders(): Record<typeof networks[number]['id'], string> {
    return networks
      .filter(network => isFinite(network.id))
      .reduce((prev, cur) => {
        return {
          ...prev,
          [cur.id]: cur.rpcLink
        };
      }, {});
  }

  public getAddress(): string {
    return this.isEnabled && this.selectedAddress;
  }

  public getNetwork(): IBlockchain {
    return this.isEnabled && BlockchainsInfo.getBlockchainById(this.selectedChain);
  }

  public get name(): WALLET_NAME {
    return WALLET_NAME.WALLET_CONNECT;
  }

  public async activate(): Promise<void> {
    try {
      const [address] = await this.core.enable();
      this.isEnabled = true;
      this.selectedAddress = address;
      this.selectedChain = String(this.core.chainId);
      this.onNetworkChanges$.next(this.getNetwork());
      this.onAddressChanges$.next(address);
    } catch (error) {
      throw new WalletlinkError();
    }
  }

  public async deActivate(): Promise<void> {
    await this.core.close();
    this.onAddressChanges$.next(null);
    this.onNetworkChanges$.next(null);
    this.isEnabled = false;
  }

  public addToken(token: Token): Promise<void> {
    if (!this.isActive) {
      throw new WalletconnectError();
    }
    if (this.getNetwork().name !== token.blockchain) {
      throw new NetworkError(token.blockchain);
    }

    return this.core.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          image: token.image
        }
      }
    });
  }

  public async switchChain(chainId: string): Promise<null | never> {
    return this.core.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }]
    });
  }

  public async addChain(params: AddEthChainParams): Promise<null | never> {
    return this.core.request({
      method: 'wallet_addEthereumChain',
      params: [params]
    });
  }

  public async signPersonal(message: string): Promise<string> {
    return new Web3(this.wallet).eth.personal.sign(message, this.address, undefined);
  }
}
