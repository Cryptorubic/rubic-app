import { BehaviorSubject } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { NetworkError } from 'src/app/core/errors/models/provider/NetworkError';
import { WalletlinkError } from 'src/app/core/errors/models/provider/WalletlinkError';
import Web3 from 'web3';
import WalletConnect from '@walletconnect/web3-provider';
import networks from 'src/app/shared/constants/blockchain/networks';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { WalletconnectError } from 'src/app/core/errors/models/provider/WalletconnectError';
import { Token } from 'src/app/shared/models/tokens/Token';
import { AddEthChainParams } from 'src/app/shared/models/blockchain/add-eth-chain-params';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { EthereumWalletProvider } from 'src/app/core/services/blockchain/providers/private-provider/private-provider';
import { WALLET_NAME } from 'src/app/core/wallets/components/wallets-modal/models/providers';
import { Web3Private } from 'src/app/core/services/blockchain/blockchain-adapters/web3/web3-private';

export class WalletConnectProvider extends EthereumWalletProvider {
  private isEnabled: boolean;

  private readonly core: WalletConnect;

  private selectedAddress: string;

  private selectedChain: string;

  public readonly onAddressChanges: BehaviorSubject<string>;

  public readonly onNetworkChanges: BehaviorSubject<IBlockchain>;

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

  public get name(): WALLET_NAME {
    return WALLET_NAME.WALLET_CONNECT;
  }

  constructor(
    web3: Web3,
    chainChange: BehaviorSubject<IBlockchain>,
    accountChange: BehaviorSubject<string>,
    errorsService: ErrorsService,
    private readonly privateAdapter: Web3Private
  ) {
    super(errorsService, privateAdapter);
    this.isEnabled = false;
    this.onAddressChanges = accountChange;
    this.onNetworkChanges = chainChange;

    this.core = this.getProvider();
    // eslint-disable-next-line
    web3.setProvider(this.core as any);
    this.setupEvents();
  }

  /**
   * Gets wallet provider based on rpc params.
   * @returns WalletConnect Wallet provider.
   */
  private getProvider(): WalletConnect {
    const rpcParams: Record<typeof networks[number]['id'], string> = networks
      .filter(network => isFinite(network.id))
      .reduce((prev, cur) => {
        return {
          ...prev,
          [cur.id]: cur.rpcLink
        };
      }, {});
    return new WalletConnect({
      rpc: rpcParams,
      bridge: 'https://bridge.walletconnect.org',
      qrcode: true
    });
  }

  /**
   * Setups chain and account change events.
   */
  private setupEvents(): void {
    this.core.on('chainChanged', (chain: string) => {
      this.selectedChain = chain;
      if (this.isEnabled) {
        this.onNetworkChanges.next(BlockchainsInfo.getBlockchainById(chain));
        console.info('Chain changed', chain);
      }
    });
    this.core.on('accountsChanged', (accounts: string[]) => {
      this.selectedAddress = accounts[0] || null;
      if (this.isEnabled) {
        this.onAddressChanges.next(this.selectedAddress);
        console.info('Selected account changed to', accounts[0]);
      }
    });
  }

  /**
   * Calculates an Ethereum specific signature.
   * @param message Data to sign.
   * @return Promise<string> The signature.
   */
  public async signPersonal(message: string): Promise<string> {
    return this.core.eth.personal.sign(message, this.address, undefined);
  }

  /**
   * Gets wallet address.
   */
  public getAddress(): string {
    return this.isEnabled && this.selectedAddress;
  }

  /**
   * Gets wallet network.
   */
  public getNetwork(): IBlockchain {
    return (
      this.isEnabled && BlockchainsInfo.getBlockchainById(this.selectedChain as BLOCKCHAIN_NAME)
    );
  }

  /**
   * Activates the wallet.
   * @param params Params for activate request.
   */
  public async activate(): Promise<void> {
    try {
      const [address] = await this.core.enable();
      this.isEnabled = true;
      this.selectedAddress = address;
      this.selectedChain = String(this.core.chainId);
      this.onNetworkChanges.next(this.getNetwork());
      this.onAddressChanges.next(address);
    } catch (error) {
      throw new WalletlinkError();
    }
  }

  /**
   * Deactivates the wallet.
   */
  public async deActivate(): Promise<void> {
    await this.core.close();
    this.onAddressChanges.next(null);
    this.onNetworkChanges.next(null);
    this.isEnabled = false;
  }

  /**
   * Adds token to the wallet.
   * @param token Token to add.
   */
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

  /**
   * Switches chain in wallet.
   * @param chainId Chain ID to switch for.
   */
  public async switchChain(chainId: string): Promise<null | never> {
    return this.core.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }]
    });
  }

  /**
   * Adds chain to the wallet.
   * @param params Add chain params.
   */
  public async addChain(params: AddEthChainParams): Promise<null | never> {
    return this.core.request({
      method: 'wallet_addEthereumChain',
      params: [params]
    });
  }
}
