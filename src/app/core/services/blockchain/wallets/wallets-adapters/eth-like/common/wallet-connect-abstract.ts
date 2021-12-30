import { BehaviorSubject } from 'rxjs';
import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import WalletConnect from '@walletconnect/web3-provider';
import { ErrorsService } from '@core/errors/errors.service';
import { Token } from '@shared/models/tokens/token';
import { AddEthChainParams } from '@shared/models/blockchain/add-eth-chain-params';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import Web3 from 'web3';
import networks from '@shared/constants/blockchain/networks';
import { IWalletConnectProviderOptions } from '@walletconnect/types';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { NetworkError } from '@core/errors/models/provider/network-error';
import { WalletconnectError } from '@core/errors/models/provider/walletconnect-error';
import { WalletlinkError } from '@core/errors/models/provider/walletlink-error';

export abstract class WalletConnectAbstractAdapter extends CommonWalletAdapter {
  protected isEnabled: boolean;

  protected selectedAddress: string;

  protected selectedChain: string;

  protected readonly onAddressChanges$: BehaviorSubject<string>;

  protected readonly onNetworkChanges$: BehaviorSubject<BlockchainData>;

  get walletType(): 'ethLike' | 'solana' {
    return 'ethLike';
  }

  get isMultiChainWallet(): boolean {
    const multiChainWalletNames = ['Trust Wallet Android', 'Trust Wallet'];
    const walletName = this.wallet.connector.peerMeta.name;
    return multiChainWalletNames.includes(walletName);
  }

  protected constructor(
    web3: Web3,
    chainChange$: BehaviorSubject<BlockchainData>,
    accountChange$: BehaviorSubject<string>,
    errorsService: ErrorsService,
    providerConfig: IWalletConnectProviderOptions
  ) {
    super(errorsService, accountChange$, chainChange$);
    this.wallet = new WalletConnect({
      rpc: this.getNetworksProviders(),
      ...providerConfig
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    web3.setProvider(this.wallet as any);
    this.initSubscriptions();
  }

  private initSubscriptions(): void {
    this.wallet.on('chainChanged', (chain: string) => {
      this.selectedChain = chain;
      if (this.isEnabled) {
        this.onNetworkChanges$.next(BlockchainsInfo.getBlockchainById(chain));
        console.info('Chain changed', chain);
      }
    });
    this.wallet.on('accountsChanged', (accounts: string[]) => {
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

  public getNetwork(): BlockchainData {
    return this.isEnabled && BlockchainsInfo.getBlockchainById(this.selectedChain);
  }

  public get name(): WALLET_NAME {
    return WALLET_NAME.WALLET_CONNECT;
  }

  public async activate(): Promise<void> {
    try {
      const [address] = await this.wallet.enable();
      this.isEnabled = true;
      this.selectedAddress = address;
      this.selectedChain = String(this.wallet.chainId);
      this.onNetworkChanges$.next(this.getNetwork());
      this.onAddressChanges$.next(address);
    } catch (error) {
      throw new WalletlinkError();
    }
  }

  public async deActivate(): Promise<void> {
    await this.wallet.close();
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

    return this.wallet.request({
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

  public async signPersonal(message: string): Promise<string> {
    return new Web3(this.wallet).eth.personal.sign(message, this.address, undefined);
  }
}
