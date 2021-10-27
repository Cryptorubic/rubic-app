import { BehaviorSubject } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { NetworkError } from 'src/app/core/errors/models/provider/NetworkError';
import { WalletlinkError } from 'src/app/core/errors/models/provider/WalletlinkError';
import WalletLink, { WalletLinkProvider as CoinbaseProvider } from 'walletlink';
import Web3 from 'web3';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { Token } from 'src/app/shared/models/tokens/Token';
import { AddEthChainParams } from 'src/app/shared/models/blockchain/add-eth-chain-params';
import { UndefinedError } from 'src/app/core/errors/models/undefined.error';
import BigNumber from 'bignumber.js';
import { RubicError } from 'src/app/core/errors/models/RubicError';
import { WalletlinkWrongNetwork } from 'src/app/core/errors/models/provider/WalletlinkWrongNetwork';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { EthereumWalletProvider } from 'src/app/core/services/blockchain/providers/private-provider/private-provider';
import { WALLET_NAME } from 'src/app/core/wallets/components/wallets-modal/models/providers';
import { RubicWindow } from 'src/app/shared/utils/rubic-window';
import { Web3Private } from 'src/app/core/services/blockchain/blockchain-adapters/web3/web3-private';

export class WalletLinkProvider extends EthereumWalletProvider {
  private isMobileMode = false;

  private isEnabled: boolean;

  private readonly core: CoinbaseProvider;

  private selectedAddress: string;

  private selectedChain: string;

  public readonly onAddressChanges: BehaviorSubject<string>;

  public readonly onNetworkChanges: BehaviorSubject<IBlockchain>;

  get isInstalled(): boolean {
    return !!this.core;
  }

  get isMultiChainWallet(): boolean {
    return false;
  }

  get isActive(): boolean {
    return this.isEnabled && Boolean(this.core?.selectedAddress);
  }

  public get address(): string {
    return this.selectedAddress;
  }

  public get name(): WALLET_NAME {
    return WALLET_NAME.WALLET_LINK;
  }

  constructor(
    window: RubicWindow,
    web3: Web3,
    chainChange: BehaviorSubject<IBlockchain>,
    accountChange: BehaviorSubject<string>,
    errorService: ErrorsService,
    private readonly privateAdapter: Web3Private,
    blockchainId?: number
  ) {
    super(errorService, privateAdapter);
    this.isEnabled = false;
    this.onAddressChanges = accountChange;
    this.onNetworkChanges = chainChange;
    this.core = this.setupProvider(window, blockchainId);
    web3.setProvider(this.core);
  }

  /**
   * Setups provider based on type of browser (mobile, or through QR code).
   * @param window Rubic window.
   * @param blockchainId Network ID to connect.
   * @returns CoinbaseProvider Wallet provider.
   */
  private setupProvider(window: RubicWindow, blockchainId: number): CoinbaseProvider {
    if (window?.ethereum?.isCoinbaseWallet) {
      // Mobile coinbase browser.
      this.isMobileMode = true;
      return window.ethereum;
    }
    const defaultWalletParams = {
      appName: 'Rubic',
      appLogoUrl: 'https://rubic.exchange/assets/images/rubic-logo.svg',
      darkMode: false
    };

    if (!blockchainId) {
      console.error('Desktop walletLink works only with predefined chainId');
      throw new UndefinedError();
    }

    const chainId = blockchainId;
    const chain = BlockchainsInfo.getBlockchainById(chainId);
    const walletLink = new WalletLink(defaultWalletParams);
    this.selectedChain = chainId.toString();
    return walletLink.makeWeb3Provider(chain.rpcLink, chainId);
  }

  /**
   * Calculates an Ethereum specific signature.
   * @param message Data to sign.
   * @return Promise<string> The signature.
   */
  public async signPersonal(message: string): Promise<string> {
    return new Web3(this.core).eth.personal.sign(message, this.address, undefined);
  }

  public getAddress(): string {
    return this.isEnabled && this.selectedAddress;
  }

  public getNetwork(): IBlockchain {
    return (
      this.isEnabled &&
      this.selectedChain &&
      BlockchainsInfo.getBlockchainByName(this.selectedChain as BLOCKCHAIN_NAME)
    );
  }

  public async activate(): Promise<void> {
    try {
      const [address] = await this.core.request({ method: 'eth_requestAccounts' });

      const activeChain = (await this.core.request({ method: 'eth_chainId' })) as string;
      const chainInfo = BlockchainsInfo.getBlockchainById(parseInt(activeChain).toString());

      // in desktop version selected into modal chain should match mobile app selected chain
      if (!this.isMobileMode) {
        if (!new BigNumber(activeChain).eq(this.selectedChain)) {
          throw new WalletlinkWrongNetwork(
            BlockchainsInfo.getBlockchainById(this.selectedChain).label
          );
        }
      }

      this.selectedAddress = address;
      this.selectedChain = chainInfo.name;
      this.isEnabled = true;
      this.onNetworkChanges.next(chainInfo);
      this.onAddressChanges.next(address);
    } catch (error) {
      if (!(error instanceof RubicError)) {
        throw new WalletlinkError();
      } else {
        throw error;
      }
    }
  }

  public async deActivate(): Promise<void> {
    this.core.close();
    this.onAddressChanges.next(undefined);
    this.onNetworkChanges.next(undefined);
    this.isEnabled = false;
  }

  public async addToken(token: Token): Promise<void> {
    if (!this.isActive) {
      throw new WalletlinkError();
    }
    if (this.getNetwork().name !== token.blockchain) {
      throw new NetworkError(token.blockchain);
    }

    await this.core.request({
      method: 'wallet_watchAsset',
      params: [
        {
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
            image: token.image
          }
        }
      ]
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
}
