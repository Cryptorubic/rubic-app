import Web3 from 'web3';
import { BehaviorSubject } from 'rxjs';
import { NetworkError } from 'src/app/core/errors/models/provider/NetworkError';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { MetamaskError } from 'src/app/core/errors/models/provider/MetamaskError';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { Token } from 'src/app/shared/models/tokens/Token';
import { AddEthChainParams } from 'src/app/shared/models/blockchain/add-eth-chain-params';
import { CoinbaseExtensionError } from 'src/app/core/errors/models/provider/CoinbaseExtensionError';
import { SignRejectError } from 'src/app/core/errors/models/provider/SignRejectError';

import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { WALLET_NAME } from 'src/app/core/wallets/components/wallets-modal/models/providers';
import { RubicWindow } from 'src/app/shared/utils/rubic-window';
import { Web3Private } from 'src/app/core/services/blockchain/providers/private-provider/common/web3-private';
import { EthereumWalletProvider } from 'src/app/core/services/blockchain/providers/private-provider/ethereum-wallet-provider';

export class MetamaskProvider extends EthereumWalletProvider {
  private isEnabled = false;

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  private readonly core: any;

  private selectedAddress: string;

  private selectedChain: string;

  public readonly onAddressChanges: BehaviorSubject<string>;

  public readonly onNetworkChanges: BehaviorSubject<IBlockchain>;

  public get isMultiChainWallet(): boolean {
    return false;
  }

  get isInstalled(): boolean {
    return !!this.core;
  }

  get isActive(): boolean {
    return this.isEnabled && !!this.selectedAddress;
  }

  public get name(): WALLET_NAME {
    return WALLET_NAME.METAMASK;
  }

  constructor(
    window: RubicWindow,
    web3: Web3,
    chainChange: BehaviorSubject<IBlockchain>,
    accountChange: BehaviorSubject<string>,
    errorsService: ErrorsService,
    private readonly privateAdapter: Web3Private
  ) {
    super(errorsService, privateAdapter);
    this.onAddressChanges = accountChange;
    this.onNetworkChanges = chainChange;
    this.privateAdapter = new Web3Private(
      web3,
      accountChange.asObservable(),
      chainChange.asObservable()
    );

    const { ethereum } = window;
    this.checkErrors(ethereum);

    web3.setProvider(ethereum);
    this.core = ethereum;
    this.setupEvents();
  }

  /**
   * Checks ethereum object for possible errors.
   * @param ethereum Window ethereum.
   */
  private checkErrors(ethereum: unknown): void {
    // @ts-ignore
    if (!ethereum?.isMetaMask) {
      throw new MetamaskError();
    }

    // installed coinbase chrome extension
    if (ethereum.hasOwnProperty('overrideIsMetaMask')) {
      throw new CoinbaseExtensionError();
    }
  }

  /**
   * Setups chain and account change events.
   */
  private setupEvents(): void {
    // Chan change event
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
      if (!this.selectedAddress) {
        this.selectedChain = null;
        this.deActivate();
      }
    });
  }

  /**
   * Calculates an Ethereum specific signature.
   * @param message Data to sign.
   * @return Promise<string> The signature.
   */
  public async signPersonal(message: string): Promise<string> {
    return new Web3(this.core).eth.personal.sign(message, this.address, undefined);
  }

  /**
   * Setups default chain and account values.
   */
  public async setupDefaultValues(): Promise<void> {
    const chain = await this.core.request({ method: 'eth_chainId' });
    const accounts = await this.core.request({ method: 'eth_accounts' });
    this.selectedChain = chain;
    [this.selectedAddress] = accounts;
  }

  /**
   * Gets wallet address.
   */
  public getAddress(): string {
    if (this.isEnabled) {
      return this.selectedAddress;
    }
    return null;
  }

  /**
   * Gets wallet network.
   */
  public getNetwork(): IBlockchain {
    if (this.isEnabled) {
      return this.selectedChain ? BlockchainsInfo.getBlockchainById(this.selectedChain) : undefined;
    }
    return null;
  }

  /**
   * Activates the wallet.
   * @param params Params for activate request.
   */
  public async activate(params?: unknown[]): Promise<void> {
    try {
      const accounts = await this.core.request({
        method: 'eth_requestAccounts',
        params
      });
      const chain = await this.core.request({ method: 'eth_chainId' });
      this.isEnabled = true;
      this.selectedChain = String(chain);
      [this.selectedAddress] = accounts;
      this.onNetworkChanges.next(this.getNetwork());
      this.onAddressChanges.next(this.selectedAddress);
    } catch (error) {
      if (
        error.code === 4001 ||
        // metamask browser
        error.message?.toLowerCase().includes('user denied message signature')
      ) {
        throw new SignRejectError();
      }
      throw new MetamaskError();
    }
  }

  /**
   * Requests permissions from the wallet.
   */
  public async requestPermissions(): Promise<{ parentCapability: 'eth_accounts' }[]> {
    try {
      return this.core.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });
    } catch (err) {
      console.error(err);
    }
    return null;
  }

  /**
   * Deactivates the wallet.
   */
  public deActivate(): void {
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
      throw new MetamaskError();
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
